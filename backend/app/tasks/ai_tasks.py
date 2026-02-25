import json
import uuid

import httpx
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.ai.parsers import parse_roadmap
from app.ai.prompts import ROADMAP_GENERATION_PROMPT
from app.config import get_settings
from app.i18n.locale import normalize_locale
from app.models.ai_prompt import AIPrompt
from app.models.analytics import AnalyticsEvent
from app.models.course import Course
from app.models.profession import Profession
from app.models.user import User
from app.models.user_path import UserPath
from app.tasks.celery_app import celery_app

settings = get_settings()


def _get_sync_session() -> Session:
    engine = create_engine(settings.DATABASE_URL_SYNC)
    return Session(engine)


@celery_app.task(name="generate_roadmap", bind=True, max_retries=3)
def generate_roadmap_task(self, user_id: str, profession_id: str):
    """Heavy AI task: generate a personalized learning roadmap."""
    session = _get_sync_session()
    try:
        user = session.execute(select(User).where(User.id == uuid.UUID(user_id))).scalar_one()
        profession = session.execute(
            select(Profession).where(Profession.id == uuid.UUID(profession_id))
        ).scalar_one()

        current = user.skill_profile or {}
        reference = profession.reference_skills or {}
        gaps = {skill: max(0.0, float(reference.get(skill, 0)) - float(current.get(skill, 0))) for skill in reference}

        courses = session.execute(select(Course)).scalars().all()
        courses_data = [{"id": str(c.id), "title": c.title, "skill_tags": c.skill_tags} for c in courses]

        prompt_row = session.execute(select(AIPrompt).where(AIPrompt.name == "roadmap_generation")).scalar_one_or_none()
        base_system_prompt = prompt_row.system_prompt if prompt_row else ROADMAP_GENERATION_PROMPT
        target_locale = normalize_locale(user.preferred_language)
        system_prompt = f"{base_system_prompt}\n\nOutput all human-readable text in locale: {target_locale}."
        model = prompt_row.model if prompt_row else "gpt-4o"
        temperature = prompt_row.temperature if prompt_row else 0.7

        user_message = json.dumps(
            {
                "gaps": gaps,
                "available_courses": courses_data,
                "target_profession": profession.title,
                "target_language": target_locale,
            },
            ensure_ascii=False,
        )

        response = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
            json={
                "model": model,
                "temperature": temperature,
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
            },
            timeout=60.0,
        )
        response.raise_for_status()
        raw = response.json()["choices"][0]["message"]["content"]
        roadmap = parse_roadmap(raw)

        path = UserPath(
            user_id=uuid.UUID(user_id),
            target_profession_id=uuid.UUID(profession_id),
            steps=roadmap.get("steps", []),
            gap_analysis=gaps,
        )
        session.add(path)
        session.flush()

        session.add(
            AnalyticsEvent(
                user_id=uuid.UUID(user_id),
                event_type="roadmap_generated",
                payload={
                    "path_id": str(path.id),
                    "profession_id": profession_id,
                    "profession_title": profession.title,
                },
            )
        )
        session.commit()

        return {"status": "ok", "path_id": str(path.id)}

    except Exception as exc:
        session.rollback()
        raise self.retry(exc=exc, countdown=30)
    finally:
        session.close()
