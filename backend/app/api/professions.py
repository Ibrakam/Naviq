import uuid
import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import from_url

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user, get_request_locale
from app.i18n.locale import Locale
from app.models.user_path import UserPath
from app.models.user import User
from app.schemas.profession import ProfessionOut
from app.schemas.skill import GapAnalysisResponse, GeneratePathRequest, RoadmapTaskStatusResponse, UserPathOut
from app.services.career_pivot import compute_gap_analysis
from app.services.gamification_service import handle_domain_event, process_achievement_checks
from app.services.translation_service import translate_struct, translate_text
from app.tasks.ai_tasks import generate_roadmap_task
from app.tasks.celery_app import celery_app

router = APIRouter(prefix="/professions", tags=["professions"])
settings = get_settings()

TASK_META_TTL_SECONDS = 60 * 60 * 24  # 24 hours


def _task_meta_key(task_id: str) -> str:
    return f"roadmap_task_meta:{task_id}"


async def _set_task_meta(task_id: str, user_id: uuid.UUID, profession_id: uuid.UUID) -> None:
    r = from_url(settings.REDIS_URL, decode_responses=True)
    payload = json.dumps({"user_id": str(user_id), "profession_id": str(profession_id)})
    await r.set(_task_meta_key(task_id), payload, ex=TASK_META_TTL_SECONDS)
    await r.aclose()


async def _get_task_meta(task_id: str) -> dict | None:
    r = from_url(settings.REDIS_URL, decode_responses=True)
    raw = await r.get(_task_meta_key(task_id))
    await r.aclose()
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


async def _localize_profession(profession: ProfessionOut, db: AsyncSession, locale: Locale) -> ProfessionOut:
    if locale == "ru":
        return profession
    payload = profession.model_dump()
    payload["title"] = await translate_text(db, payload.get("title"), target_lang=locale)
    payload["description"] = await translate_text(db, payload.get("description"), target_lang=locale)
    payload["category"] = await translate_text(db, payload.get("category"), target_lang=locale)
    return ProfessionOut(**payload)


@router.get("/", response_model=list[ProfessionOut])
async def list_professions(
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    from app.models.profession import Profession

    result = await db.execute(select(Profession))
    professions = [ProfessionOut.model_validate(item) for item in result.scalars().all()]
    return [await _localize_profession(item, db, locale) for item in professions]


@router.get("/{profession_id}", response_model=ProfessionOut)
async def get_profession(
    profession_id: uuid.UUID,
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    from app.models.profession import Profession

    result = await db.execute(select(Profession).where(Profession.id == profession_id))
    profession = result.scalar_one_or_none()
    if not profession:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profession not found")
    serialized = ProfessionOut.model_validate(profession)
    return await _localize_profession(serialized, db, locale)


@router.get("/{profession_id}/gap", response_model=GapAnalysisResponse)
async def gap_analysis(
    profession_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    try:
        gaps, match_pct, profession = await compute_gap_analysis(current_user, profession_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    response = GapAnalysisResponse(
        gaps=gaps,
        match_percentage=match_pct,
        profession_id=profession.id,
        profession_title=profession.title,
    )
    if locale == "ru":
        return response
    payload = response.model_dump()
    payload["profession_title"] = await translate_text(db, payload.get("profession_title"), target_lang=locale)
    return GapAnalysisResponse(**payload)


@router.post("/generate-path", status_code=status.HTTP_202_ACCEPTED)
async def generate_path(
    body: GeneratePathRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = generate_roadmap_task.delay(str(current_user.id), str(body.profession_id))
    await _set_task_meta(task.id, current_user.id, body.profession_id)
    await handle_domain_event(
        db,
        current_user,
        "career_pivot_requested",
        {"task_id": task.id, "profession_id": str(body.profession_id)},
    )
    return {"task_id": task.id, "status": "processing"}


@router.get("/tasks/{task_id}", response_model=RoadmapTaskStatusResponse)
async def task_status(
    task_id: str,
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    meta = await _get_task_meta(task_id)
    if not meta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if meta.get("user_id") != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to view this task")

    result = celery_app.AsyncResult(task_id)
    state = (result.state or "PENDING").upper()

    if state in {"PENDING", "RECEIVED", "STARTED", "RETRY"}:
        return RoadmapTaskStatusResponse(task_id=task_id, status="processing")

    if state == "SUCCESS":
        payload = result.result if isinstance(result.result, dict) else {}
        path_id_raw = payload.get("path_id")
        path_id = None
        if path_id_raw:
            try:
                path_id = uuid.UUID(str(path_id_raw))
            except ValueError:
                path_id = None
        await process_achievement_checks(db, current_user, "roadmap_generated", {"path_id": str(path_id) if path_id else None})
        return RoadmapTaskStatusResponse(task_id=task_id, status="ok", path_id=path_id)

    error_message = str(result.result) if result.result else f"Task state: {state}"
    if locale != "ru":
        error_message = await translate_text(db, error_message, target_lang=locale)
    return RoadmapTaskStatusResponse(task_id=task_id, status="failed", error=error_message)


@router.get("/paths/{path_id}", response_model=UserPathOut)
async def get_path(
    path_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserPath).where(UserPath.id == path_id, UserPath.user_id == current_user.id)
    )
    path = result.scalar_one_or_none()
    if not path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Path not found")

    profession_title = path.target_profession.title if path.target_profession else None
    response = UserPathOut(
        id=path.id,
        user_id=path.user_id,
        target_profession_id=path.target_profession_id,
        steps=path.steps if isinstance(path.steps, list) else [],
        gap_analysis=path.gap_analysis,
        status=path.status,
        created_at=path.created_at,
        updated_at=path.updated_at,
        profession_title=profession_title,
    )
    if locale == "ru":
        return response
    payload = response.model_dump()
    payload["steps"] = await translate_struct(db, payload.get("steps"), target_lang=locale)
    payload["profession_title"] = await translate_text(db, payload.get("profession_title"), target_lang=locale)
    return UserPathOut(**payload)
