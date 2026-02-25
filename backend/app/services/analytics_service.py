from sqlalchemy import String, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics import AnalyticsEvent
from app.models.user import User
from app.models.user_path import UserPath


async def get_skill_heatmap(db: AsyncSession) -> dict[str, float]:
    """Average skill values across all users who have a skill profile."""
    result = await db.execute(select(User.skill_profile).where(User.skill_profile.isnot(None)))
    profiles = [row[0] for row in result.all() if row[0]]

    if not profiles:
        return {}

    aggregated: dict[str, list[float]] = {}
    for profile in profiles:
        for skill, value in profile.items():
            aggregated.setdefault(skill, []).append(float(value))

    return {skill: round(sum(vals) / len(vals), 3) for skill, vals in aggregated.items()}


async def get_conversion_funnel(db: AsyncSession) -> dict[str, int]:
    """Count users at each stage: registered, tested, generated paths."""
    total = (await db.execute(select(func.count(User.id)))).scalar() or 0

    tested = (
        await db.execute(
            select(func.count(func.distinct(AnalyticsEvent.user_id))).where(
                AnalyticsEvent.event_type == "skill_analysis"
            )
        )
    ).scalar() or 0

    paths_generated = (
        await db.execute(select(func.count(func.distinct(UserPath.user_id))))
    ).scalar() or 0

    return {"registered": total, "tested": tested, "generated_path": paths_generated}


async def get_top_careers(db: AsyncSession, limit: int = 10) -> list[dict]:
    """Top professions by number of generated roadmaps."""
    from app.models.profession import Profession

    result = await db.execute(
        select(Profession.title, func.count(UserPath.id).label("count"))
        .join(UserPath, Profession.id == UserPath.target_profession_id)
        .group_by(Profession.title)
        .order_by(text("count DESC"))
        .limit(limit)
    )
    return [{"profession": row[0], "count": row[1]} for row in result.all()]


async def get_simulation_dropoff(db: AsyncSession) -> list[dict]:
    """Which simulation step users drop off at (completed vs started)."""
    started = (
        await db.execute(
            select(
                AnalyticsEvent.payload["simulation_id"].astext.cast(String).label("sim_id"),
                func.count().label("starts"),
            )
            .where(AnalyticsEvent.event_type == "simulation_start")
            .group_by("sim_id")
        )
    ).all()

    completed = (
        await db.execute(
            select(
                AnalyticsEvent.payload["simulation_id"].astext.cast(String).label("sim_id"),
                func.count().label("completions"),
            )
            .where(AnalyticsEvent.event_type == "simulation_complete")
            .group_by("sim_id")
        )
    ).all()

    completed_map = {row[0]: row[1] for row in completed}
    return [
        {
            "simulation_id": row[0],
            "starts": row[1],
            "completions": completed_map.get(row[0], 0),
            "dropoff_rate": round(1 - completed_map.get(row[0], 0) / row[1], 3) if row[1] > 0 else 0,
        }
        for row in started
    ]
