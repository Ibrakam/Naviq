from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course


async def recommend_courses(gaps: dict[str, float], db: AsyncSession, limit: int = 10) -> list[Course]:
    top_gap_skills = sorted(gaps.items(), key=lambda x: x[1], reverse=True)[:5]
    if not top_gap_skills:
        return []

    result = await db.execute(select(Course).where(Course.provider == "Naviq"))
    all_courses = result.scalars().all()

    scored: list[tuple[float, Course]] = []
    for course in all_courses:
        tags = course.skill_tags or {}
        score = sum(gaps.get(skill, 0.0) * float(tags.get(skill, 0.0)) for skill in gaps)
        if score > 0:
            scored.append((score, course))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [course for _, course in scored[:limit]]
