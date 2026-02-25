from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, get_request_locale
from app.i18n.locale import Locale
from app.models.university import University
from app.models.user import User
from app.schemas.gamification import (
    AchievementOut,
    CareerIdentityCardOut,
    DailyQuestCompleteOut,
    DailyQuestOut,
    GamificationLevelOut,
    GamificationNotificationOut,
    GamificationProfileOut,
    UniversityLeaderboardEntryOut,
)
from app.schemas.university import UniversityOut
from app.services.gamification_service import (
    complete_daily_quest,
    get_career_card,
    get_daily_quest,
    get_notifications,
    get_profile,
    get_weekly_leaderboard,
    list_achievements,
    list_levels,
    process_achievement_checks,
)
from app.services.translation_service import translate_struct, translate_text

router = APIRouter(prefix="/gamification", tags=["gamification"])


async def _localize_profile(
    profile: GamificationProfileOut,
    db: AsyncSession,
    locale: Locale,
) -> GamificationProfileOut:
    if locale == "ru":
        return profile
    payload = profile.model_dump()
    payload["rank_title"] = await translate_text(db, payload.get("rank_title"), target_lang=locale)
    return GamificationProfileOut(**payload)


async def _localize_levels(
    levels: list[GamificationLevelOut],
    db: AsyncSession,
    locale: Locale,
) -> list[GamificationLevelOut]:
    if locale == "ru":
        return levels
    localized: list[GamificationLevelOut] = []
    for level in levels:
        payload = level.model_dump()
        payload["title"] = await translate_text(db, payload.get("title"), target_lang=locale)
        payload["ui_upgrade"] = await translate_text(db, payload.get("ui_upgrade"), target_lang=locale)
        localized.append(GamificationLevelOut(**payload))
    return localized


async def _localize_achievements(
    achievements: list[AchievementOut],
    db: AsyncSession,
    locale: Locale,
) -> list[AchievementOut]:
    if locale == "ru":
        return achievements
    localized: list[AchievementOut] = []
    for achievement in achievements:
        payload = achievement.model_dump()
        payload["name"] = await translate_text(db, payload.get("name"), target_lang=locale)
        payload["reward"] = await translate_struct(db, payload.get("reward"), target_lang=locale)
        localized.append(AchievementOut(**payload))
    return localized


async def _localize_daily_quest(
    quest: DailyQuestOut,
    db: AsyncSession,
    locale: Locale,
) -> DailyQuestOut:
    if locale == "ru":
        return quest
    payload = quest.model_dump()
    payload["title"] = await translate_text(db, payload.get("title"), target_lang=locale)
    payload["prompt"] = await translate_text(db, payload.get("prompt"), target_lang=locale)
    return DailyQuestOut(**payload)


async def _localize_notifications(
    notifications: list[GamificationNotificationOut],
    db: AsyncSession,
    locale: Locale,
) -> list[GamificationNotificationOut]:
    if locale == "ru":
        return notifications
    localized: list[GamificationNotificationOut] = []
    for notification in notifications:
        payload = notification.model_dump()
        payload["payload"] = await translate_struct(db, payload.get("payload"), target_lang=locale)
        localized.append(GamificationNotificationOut(**payload))
    return localized


async def _localize_career_card(
    card: CareerIdentityCardOut,
    db: AsyncSession,
    locale: Locale,
) -> CareerIdentityCardOut:
    if locale == "ru":
        return card
    payload = card.model_dump()
    payload["title"] = await translate_text(db, payload.get("title"), target_lang=locale)
    payload["rank"] = await translate_text(db, payload.get("rank"), target_lang=locale)
    payload["top_badges"] = await translate_struct(db, payload.get("top_badges"), target_lang=locale)
    return CareerIdentityCardOut(**payload)


@router.get("/profile", response_model=GamificationProfileOut)
async def gamification_profile(
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    await process_achievement_checks(db, current_user)
    profile = await get_profile(db, current_user)
    return await _localize_profile(profile, db, locale)


@router.get("/levels", response_model=list[GamificationLevelOut])
async def gamification_levels(
    _current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    levels = await list_levels(db)
    return await _localize_levels(levels, db, locale)


@router.get("/achievements", response_model=list[AchievementOut])
async def gamification_achievements(
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    achievements = await list_achievements(db, current_user)
    return await _localize_achievements(achievements, db, locale)


@router.get("/daily-quest", response_model=DailyQuestOut)
async def gamification_daily_quest(
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    quest = await get_daily_quest(db, current_user)
    return await _localize_daily_quest(quest, db, locale)


@router.post("/daily-quest/complete", response_model=DailyQuestCompleteOut)
async def gamification_complete_daily_quest(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await complete_daily_quest(db, current_user)


@router.get("/university-leaderboard", response_model=list[UniversityLeaderboardEntryOut])
async def gamification_university_leaderboard(
    period: str = Query("weekly"),
    _current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if period != "weekly":
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Only weekly period is supported")
    return await get_weekly_leaderboard(db)


@router.get("/notifications", response_model=list[GamificationNotificationOut])
async def gamification_notifications(
    since: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    since_dt: datetime | None = None
    if since:
        try:
            since_dt = datetime.fromisoformat(since)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid since cursor") from exc

    notifications = await get_notifications(db, current_user, since=since_dt, limit=limit)
    return await _localize_notifications(notifications, db, locale)


@router.get("/career-card", response_model=CareerIdentityCardOut)
async def gamification_career_card(
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    card = await get_career_card(db, current_user)
    return await _localize_career_card(card, db, locale)


@router.get("/universities", response_model=list[UniversityOut])
async def list_active_universities(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(University).where(University.is_active.is_(True)).order_by(University.name.asc())
    )
    return result.scalars().all()
