import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profession import Profession
from app.models.user import User


async def compute_gap_analysis(
    user: User, profession_id: uuid.UUID, db: AsyncSession
) -> tuple[dict[str, float], float, Profession]:
    result = await db.execute(select(Profession).where(Profession.id == profession_id))
    profession = result.scalar_one_or_none()
    if not profession:
        raise ValueError(f"Profession {profession_id} not found")

    reference = profession.reference_skills or {}
    current = user.skill_profile or {}

    all_skills = set(reference.keys()) | set(current.keys())

    gaps: dict[str, float] = {}
    total_ref = 0.0
    total_match = 0.0

    for skill in all_skills:
        ref_val = float(reference.get(skill, 0.0))
        cur_val = float(current.get(skill, 0.0))
        gap = max(0.0, ref_val - cur_val)
        gaps[skill] = round(gap, 3)
        total_ref += ref_val
        total_match += min(cur_val, ref_val)

    match_percentage = round((total_match / total_ref * 100) if total_ref > 0 else 0.0, 1)

    return gaps, match_percentage, profession
