from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, get_request_locale
from app.models.user import User
from app.schemas.skill import AnalyzeSkillsRequest, AssessmentQuestionOut, SkillVector
from app.i18n.locale import Locale
from app.services.gamification_service import grant_xp, handle_domain_event
from app.services.assessment_question_bank import get_skill_questions
from app.services.skill_engine import analyze_skills
from app.services.translation_service import translate_text

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("/questions", response_model=list[AssessmentQuestionOut])
async def questions(
    _current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    items = get_skill_questions(locale=locale)
    if locale == "ru":
        return items
    localized: list[dict] = []
    for question in items:
        payload = dict(question)
        payload["question"] = await translate_text(db, str(payload.get("question") or ""), target_lang=locale)
        options = payload.get("options") if isinstance(payload.get("options"), list) else []
        localized_options: list[dict] = []
        for option in options:
            option_payload = dict(option)
            option_payload["text"] = await translate_text(db, str(option_payload.get("text") or ""), target_lang=locale)
            localized_options.append(option_payload)
        payload["options"] = localized_options
        localized.append(payload)
    return localized


@router.post("/analyze", response_model=SkillVector)
async def analyze(
    body: AnalyzeSkillsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.attempts_balance <= 0:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="No attempts remaining")

    answers_raw = [{"question_id": a.question_id, "answer": a.answer} for a in body.answers]

    try:
        skill_vector = await analyze_skills(current_user, answers_raw, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"AI service error: {e}")

    current_user.attempts_balance -= 1
    await grant_xp(db, current_user, 50, reason="skill_analysis")
    await handle_domain_event(db, current_user, "skill_analysis", {"skills": skill_vector})

    return SkillVector(**skill_vector)
