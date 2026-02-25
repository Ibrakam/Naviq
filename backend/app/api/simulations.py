import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, get_request_locale
from app.i18n.locale import Locale
from app.models.simulation import Simulation
from app.models.user import User
from app.schemas.simulation import SimulationOut, SimulationStepResponse, StepAnswerRequest
from app.services.gamification_service import grant_xp, handle_domain_event
from app.services.simulation_engine import process_step, start_simulation
from app.services.translation_service import translate_struct, translate_text

router = APIRouter(prefix="/simulations", tags=["simulations"])


def _is_hard_simulation(simulation: Simulation) -> bool:
    profession = simulation.profession
    category = (profession.category if profession else "") or ""
    title = (profession.title if profession else simulation.title) or simulation.title
    blob = f"{category} {title}".lower()
    hard_tokens = ("dev", "data", "backend", "frontend", "science", "engineer", "it")
    return any(token in blob for token in hard_tokens)


def _extract_quality_score(step_answers: list[dict], total_steps: int) -> int:
    if total_steps <= 0:
        return 0
    filled = sum(1 for item in step_answers if str(item.get("answer") or "").strip())
    return max(0, min(100, int(round((filled / total_steps) * 100))))


def _resolved_conflict(step_answers: list[dict]) -> bool:
    joined = " ".join(str(item.get("answer") or "").lower() for item in step_answers)
    keywords = ("align", "компром", "listen", "feedback", "stakeholder", "команда", "соглас")
    return any(word in joined for word in keywords)


async def _localize_simulation(simulation: SimulationOut, db: AsyncSession, locale: Locale) -> SimulationOut:
    if locale == "ru":
        return simulation
    payload = simulation.model_dump()
    payload["title"] = await translate_text(db, payload.get("title"), target_lang=locale)
    payload["description"] = await translate_text(db, payload.get("description"), target_lang=locale)
    localized_steps: list[dict] = []
    for step in payload.get("steps", []):
        step_payload = dict(step)
        step_payload["content"] = await translate_struct(db, step_payload.get("content"), target_lang=locale)
        localized_steps.append(step_payload)
    payload["steps"] = localized_steps
    return SimulationOut(**payload)


async def _localize_step_response(response: SimulationStepResponse, db: AsyncSession, locale: Locale) -> SimulationStepResponse:
    if locale == "ru":
        return response
    payload = response.model_dump()
    if payload.get("step"):
        step_payload = dict(payload["step"])
        step_payload["content"] = await translate_struct(db, step_payload.get("content"), target_lang=locale)
        payload["step"] = step_payload
    return SimulationStepResponse(**payload)


@router.get("/", response_model=list[SimulationOut])
async def list_simulations(
    _current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Simulation).where(Simulation.is_active.is_(True)))
    simulations = [SimulationOut.model_validate(item) for item in result.scalars().all()]
    return [await _localize_simulation(item, db, locale) for item in simulations]


@router.post("/{simulation_id}/start", response_model=SimulationStepResponse)
async def start(
    simulation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Simulation).where(Simulation.id == simulation_id))
    simulation = result.scalar_one_or_none()
    if not simulation or not simulation.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found or inactive")

    state, first_step = await start_simulation(current_user.id, simulation)

    await handle_domain_event(db, current_user, "simulation_start", {"simulation_id": str(simulation_id)})

    response = SimulationStepResponse(step=first_step, session=state, finished=False)
    return await _localize_step_response(response, db, locale)


@router.post("/{simulation_id}/step", response_model=SimulationStepResponse)
async def step(
    simulation_id: uuid.UUID,
    body: StepAnswerRequest,
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Simulation).where(Simulation.id == simulation_id))
    simulation = result.scalar_one_or_none()
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")

    try:
        state, next_step = await process_step(current_user.id, simulation, body.answer)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if state.completed:
        quality_score = _extract_quality_score(state.answers, len(simulation.steps))
        is_hard = _is_hard_simulation(simulation)
        payload = {
            "simulation_id": str(simulation_id),
            "answers": state.answers,
            "quality_score": quality_score,
            "is_hard": is_hard,
            "resolved_conflict": _resolved_conflict(state.answers),
            "profession_title": simulation.profession.title if simulation.profession else None,
            "profession_category": simulation.profession.category if simulation.profession else None,
        }
        await grant_xp(db, current_user, 100, reason="simulation_complete", payload=payload)
        await handle_domain_event(db, current_user, "simulation_complete", payload)

    response = SimulationStepResponse(step=next_step, session=state, finished=state.completed)
    return await _localize_step_response(response, db, locale)
