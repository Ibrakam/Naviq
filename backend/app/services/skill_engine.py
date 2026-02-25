import json

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.client import call_llm, get_prompt
from app.ai.parsers import EXPECTED_SKILLS, parse_skill_vector
from app.ai.prompts import SKILL_ANALYSIS_PROMPT
from app.models.user import User
from app.services.assessment_question_bank import derive_skill_vector_from_answers


def _blend_skill_vectors(primary: dict[str, float], secondary: dict[str, float], primary_weight: float) -> dict[str, float]:
    secondary_weight = 1.0 - primary_weight
    blended: dict[str, float] = {}
    for skill in EXPECTED_SKILLS:
        p = float(primary.get(skill, 0.0))
        s = float(secondary.get(skill, 0.0))
        value = max(0.0, min(1.0, (p * primary_weight) + (s * secondary_weight)))
        blended[skill] = round(value, 3)
    return blended


async def analyze_skills(user: User, answers: list[dict], db: AsyncSession) -> dict[str, float]:
    derived_vector = derive_skill_vector_from_answers(answers)

    prompt_record = await get_prompt("skill_analysis", db)
    system_prompt = prompt_record.system_prompt if prompt_record else SKILL_ANALYSIS_PROMPT
    model = prompt_record.model if prompt_record else "gpt-4o"
    temperature = prompt_record.temperature if prompt_record else 0.7

    llm_vector: dict[str, float] | None = None
    user_message = json.dumps({"answers": answers}, ensure_ascii=False)

    try:
        raw_response = await call_llm(system_prompt, user_message, model=model, temperature=temperature)
        llm_vector = parse_skill_vector(raw_response)
    except Exception:
        llm_vector = None

    if llm_vector:
        skill_vector = _blend_skill_vectors(primary=derived_vector, secondary=llm_vector, primary_weight=0.6)
    else:
        skill_vector = derived_vector

    user.skill_profile = skill_vector
    await db.flush()

    return skill_vector
