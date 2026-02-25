import uuid
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import and_, delete, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics import AnalyticsEvent
from app.models.gamification import (
    Achievement,
    AchievementRarity,
    DailyQuest,
    GamificationLevel,
    GamificationNotification,
    LeaderboardStudentContribution,
    LeaderboardWeeklySnapshot,
    QuestType,
    UserAchievement,
    UserDailyQuest,
    UserStreak,
)
from app.models.user import User
from app.models.user_path import UserPath
from app.models.university import University
from app.schemas.gamification import (
    AchievementOut,
    CareerIdentityCardOut,
    DailyQuestCompleteOut,
    DailyQuestOut,
    GamificationLevelOut,
    GamificationNotificationOut,
    GamificationProfileOut,
    UniversityLeaderboardEntryOut,
    UniversityMiniOut,
)
from app.services.gamification_realtime import gamification_ws_manager
from app.services.translation_service import translate_struct


LEVEL_CATALOG = [
    {"level": 1, "title": "Lost Student", "xp_min": 0, "xp_max": 119, "ui_upgrade": "Base neon border, low-glow HUD"},
    {"level": 2, "title": "Signal Seeker", "xp_min": 120, "xp_max": 299, "ui_upgrade": "Subtle cyan scanline background"},
    {"level": 3, "title": "Path Finder", "xp_min": 300, "xp_max": 549, "ui_upgrade": "Radar pulse on hover"},
    {"level": 4, "title": "Skill Builder", "xp_min": 550, "xp_max": 899, "ui_upgrade": "XP bar adds moving gradient"},
    {"level": 5, "title": "Simulation Runner", "xp_min": 900, "xp_max": 1349, "ui_upgrade": "Card edges get animated trace"},
    {"level": 6, "title": "Pivot Explorer", "xp_min": 1350, "xp_max": 1899, "ui_upgrade": "Ghost Mentor gains brighter core"},
    {"level": 7, "title": "Career Strategist", "xp_min": 1900, "xp_max": 2599, "ui_upgrade": "Mini badge slots in profile header"},
    {
        "level": 8,
        "title": "Industry Challenger",
        "xp_min": 2600,
        "xp_max": 3499,
        "ui_upgrade": "Stronger parallax + holographic highlights",
    },
    {"level": 9, "title": "Systems Architect", "xp_min": 3500, "xp_max": 4699, "ui_upgrade": "3D medal shelf unlocked"},
    {
        "level": 10,
        "title": "Talent Catalyst",
        "xp_min": 4700,
        "xp_max": 6199,
        "ui_upgrade": "Dashboard accent shifts to dual neon palette",
    },
    {
        "level": 11,
        "title": "Elite Operator",
        "xp_min": 6200,
        "xp_max": 7999,
        "ui_upgrade": "Premium border shader + artifact aura",
    },
    {
        "level": 12,
        "title": "Career God",
        "xp_min": 8000,
        "xp_max": None,
        "ui_upgrade": "Legendary frame, signature particle trail, title glow",
    },
]

ACHIEVEMENT_CATALOG = [
    {
        "key": "awakening",
        "name": "Пробуждение (The Awakening)",
        "rarity": AchievementRarity.COMMON,
        "condition_type": "first_skill_analysis",
        "condition_payload": {"event": "skill_analysis"},
        "reward_payload": {"xp": 50},
    },
    {
        "key": "quantum_leap",
        "name": "Квантовый скачок (Quantum Leap)",
        "rarity": AchievementRarity.RARE,
        "condition_type": "career_pivot_completed",
        "condition_payload": {"paths_required": 2},
        "reward_payload": {"xp": 150, "icon": "portal"},
    },
    {
        "key": "relentless",
        "name": "Неудержимый (Relentless)",
        "rarity": AchievementRarity.COMMON,
        "condition_type": "daily_quest_streak",
        "condition_payload": {"streak_days": 7},
        "reward_payload": {"xp_multiplier": 1.2, "duration_hours": 24},
    },
    {
        "key": "binary_mind",
        "name": "Бинарный разум (Binary Mind)",
        "rarity": AchievementRarity.UNCOMMON,
        "condition_type": "hard_simulation_quality",
        "condition_payload": {"min_quality": 90},
        "reward_payload": {"xp": 200},
    },
    {
        "key": "chaos_architect",
        "name": "Архитектор Хаоса (Chaos Architect)",
        "rarity": AchievementRarity.UNCOMMON,
        "condition_type": "pm_hr_conflict_success",
        "condition_payload": {},
        "reward_payload": {"badge": "golden_shield"},
    },
    {
        "key": "multiverse_explorer",
        "name": "Исследователь мультивселенной (Multiverse Explorer)",
        "rarity": AchievementRarity.RARE,
        "condition_type": "simulation_category_diversity",
        "condition_payload": {"distinct_categories": 5},
        "reward_payload": {"title": "Мультипотенциал"},
    },
    {
        "key": "top_1_percent",
        "name": "В одном проценте (The Top 1%)",
        "rarity": AchievementRarity.EPIC,
        "condition_type": "weekly_university_rank_1",
        "condition_payload": {},
        "reward_payload": {"elite_chat_access": True},
    },
    {
        "key": "deep_focus",
        "name": "Ночное прозрение (Deep Focus)",
        "rarity": AchievementRarity.UNCOMMON,
        "condition_type": "night_hard_simulation",
        "condition_payload": {"from_hour": 0, "to_hour": 5},
        "reward_payload": {"badge": "owl"},
    },
    {
        "key": "grandmaster",
        "name": "Грандмастер (Grandmaster)",
        "rarity": AchievementRarity.LEGENDARY,
        "condition_type": "all_skill_axes_80",
        "condition_payload": {"min_value": 0.8, "axes": 10},
        "reward_payload": {"badge": "verified_by_naviq"},
    },
    {
        "key": "evangelist",
        "name": "Евангелист (The Evangelist)",
        "rarity": AchievementRarity.RARE,
        "condition_type": "referrals_successful",
        "condition_payload": {"count": 3},
        "reward_payload": {"xp": 500},
    },
]

RARITY_POINTS = {
    AchievementRarity.COMMON: 20,
    AchievementRarity.UNCOMMON: 40,
    AchievementRarity.RARE: 70,
    AchievementRarity.EPIC: 120,
    AchievementRarity.LEGENDARY: 200,
}

QUEST_ROTATION = [
    QuestType.MICRO_REFLECTION,
    QuestType.ONE_DECISION_SIM,
    QuestType.SKILL_FLASH,
    QuestType.PIVOT_CHECK,
]

QUEST_TEXT = {
    QuestType.MICRO_REFLECTION: {
        "title": "Micro Reflection",
        "prompt": "За 2 минуты: что сегодня прокачал лучше всего и почему это важно для карьеры?",
    },
    QuestType.ONE_DECISION_SIM: {
        "title": "One Decision",
        "prompt": "Выбери одно из 3 решений для рабочей мини-ситуации и кратко аргументируй.",
    },
    QuestType.SKILL_FLASH: {
        "title": "Skill Flash",
        "prompt": "Оцени один навык 1-10 и напиши следующий микро-шаг улучшения.",
    },
    QuestType.PIVOT_CHECK: {
        "title": "Pivot Check",
        "prompt": "Сравни текущую цель с альтернативной профессией и выбери 1 приоритет на сегодня.",
    },
}


@dataclass
class AchievementCheckResult:
    unlocked: bool
    progress: float


async def ensure_gamification_catalog(db: AsyncSession) -> None:
    level_result = await db.execute(select(GamificationLevel))
    levels = {item.level: item for item in level_result.scalars().all()}
    for row in LEVEL_CATALOG:
        current = levels.get(row["level"])
        if current is None:
            db.add(GamificationLevel(**row))
            continue
        current.title = row["title"]
        current.xp_min = row["xp_min"]
        current.xp_max = row["xp_max"]
        current.ui_upgrade = row["ui_upgrade"]

    ach_result = await db.execute(select(Achievement))
    existing = {item.key: item for item in ach_result.scalars().all()}
    for row in ACHIEVEMENT_CATALOG:
        current = existing.get(row["key"])
        if current is None:
            db.add(Achievement(**row, season=1, is_active=True))
            continue
        current.name = row["name"]
        current.rarity = row["rarity"]
        current.condition_type = row["condition_type"]
        current.condition_payload = row["condition_payload"]
        if current.reward_payload is None:
            current.reward_payload = row["reward_payload"]


async def list_levels(db: AsyncSession) -> list[GamificationLevelOut]:
    await ensure_gamification_catalog(db)
    result = await db.execute(select(GamificationLevel).order_by(GamificationLevel.level.asc()))
    return [GamificationLevelOut.model_validate(item) for item in result.scalars().all()]


def _safe_tz(tz_name: str | None) -> ZoneInfo:
    try:
        return ZoneInfo(tz_name or "UTC")
    except Exception:
        return ZoneInfo("UTC")


def _user_now(user: User) -> datetime:
    return datetime.now(tz=_safe_tz(user.timezone))


def _week_window(now_utc: datetime) -> tuple[date, date, datetime, datetime]:
    week_start_date = (now_utc - timedelta(days=now_utc.weekday())).date()
    week_end_date = week_start_date + timedelta(days=6)
    week_start_dt = datetime.combine(week_start_date, time.min, tzinfo=timezone.utc)
    week_end_dt = datetime.combine(week_end_date, time.max, tzinfo=timezone.utc)
    return week_start_date, week_end_date, week_start_dt, week_end_dt


async def _load_levels(db: AsyncSession) -> list[GamificationLevel]:
    result = await db.execute(select(GamificationLevel).order_by(GamificationLevel.level.asc()))
    return result.scalars().all()


def _resolve_level(levels: list[GamificationLevel], xp: int) -> GamificationLevel:
    current = levels[0]
    for level in levels:
        max_xp = level.xp_max if level.xp_max is not None else 10**9
        if level.xp_min <= xp <= max_xp:
            return level
        if xp >= level.xp_min:
            current = level
    return current


def _next_level(levels: list[GamificationLevel], current_level: int) -> GamificationLevel | None:
    for level in levels:
        if level.level == current_level + 1:
            return level
    return None


async def create_notification(db: AsyncSession, user_id: uuid.UUID, notification_type: str, payload: dict | None = None) -> None:
    item = GamificationNotification(user_id=user_id, type=notification_type, payload=payload)
    db.add(item)
    await db.flush()

    ws_payload: dict = payload or {}
    user = await db.get(User, user_id)
    if user is not None and user.preferred_language != "ru":
        localized = await translate_struct(db, ws_payload, target_lang="uz")
        if isinstance(localized, dict):
            ws_payload = localized

    await gamification_ws_manager.send_to_user(
        user_id,
        {
            "id": str(item.id),
            "type": notification_type,
            "payload": ws_payload,
            "created_at": item.created_at.isoformat() if item.created_at else datetime.now(timezone.utc).isoformat(),
        },
    )


async def record_event(db: AsyncSession, user: User, event_type: str, payload: dict | None = None) -> None:
    db.add(AnalyticsEvent(user_id=user.id, event_type=event_type, payload=payload or {}))


async def grant_xp(
    db: AsyncSession,
    user: User,
    base_xp: int,
    reason: str,
    payload: dict | None = None,
) -> int:
    await ensure_gamification_catalog(db)
    levels = await _load_levels(db)

    prev_xp = user.xp
    prev_level = _resolve_level(levels, prev_xp)

    now_utc = datetime.now(timezone.utc)
    multiplier = 1.0
    if user.xp_multiplier_until and user.xp_multiplier_until > now_utc:
        multiplier = max(1.0, float(user.xp_multiplier))

    gained_xp = max(0, int(round(base_xp * multiplier)))
    user.xp += gained_xp

    xp_payload = {
        "reason": reason,
        "base_xp": base_xp,
        "multiplier": multiplier,
        "gained_xp": gained_xp,
    }
    if payload:
        xp_payload.update(payload)

    db.add(AnalyticsEvent(user_id=user.id, event_type="xp_gained", payload=xp_payload))

    await create_notification(
        db,
        user.id,
        "xp_gained",
        {
            "gained_xp": gained_xp,
            "reason": reason,
            "total_xp": user.xp,
            "sound": "major" if gained_xp >= 100 else "minor",
        },
    )

    new_level = _resolve_level(levels, user.xp)
    if new_level.level > prev_level.level:
        await create_notification(
            db,
            user.id,
            "level_up",
            {
                "from_level": prev_level.level,
                "to_level": new_level.level,
                "title": new_level.title,
                "sound": "level_up_major" if new_level.level >= 8 else "level_up_minor",
            },
        )

    return gained_xp


async def _get_or_create_streak(db: AsyncSession, user_id: uuid.UUID) -> UserStreak:
    item = await db.get(UserStreak, user_id)
    if item:
        return item

    item = UserStreak(user_id=user_id, current_streak=0, longest_streak=0, shield_count=0)
    db.add(item)
    await db.flush()
    return item


async def _get_or_create_daily_quest(db: AsyncSession, quest_date: date) -> DailyQuest:
    result = await db.execute(select(DailyQuest).where(DailyQuest.quest_date == quest_date))
    quest = result.scalar_one_or_none()
    if quest:
        return quest

    quest_type = QUEST_ROTATION[quest_date.toordinal() % len(QUEST_ROTATION)]
    template = QUEST_TEXT[quest_type]
    quest = DailyQuest(
        quest_date=quest_date,
        quest_type=quest_type,
        title=template["title"],
        prompt=template["prompt"],
        payload={"max_duration_seconds": 180},
        xp_reward=25,
    )
    db.add(quest)
    await db.flush()
    return quest


async def get_daily_quest(db: AsyncSession, user: User) -> DailyQuestOut:
    await ensure_gamification_catalog(db)
    local_today = _user_now(user).date()
    quest = await _get_or_create_daily_quest(db, local_today)
    completion_result = await db.execute(
        select(UserDailyQuest.id).where(UserDailyQuest.user_id == user.id, UserDailyQuest.quest_id == quest.id)
    )
    completed = completion_result.scalar_one_or_none() is not None

    return DailyQuestOut(
        id=quest.id,
        quest_type=quest.quest_type,
        title=quest.title,
        prompt=quest.prompt,
        xp_reward=quest.xp_reward,
        completed=completed,
    )


async def complete_daily_quest(db: AsyncSession, user: User) -> DailyQuestCompleteOut:
    local_now = _user_now(user)
    local_today = local_now.date()
    quest = await _get_or_create_daily_quest(db, local_today)

    existing = await db.execute(
        select(UserDailyQuest).where(UserDailyQuest.user_id == user.id, UserDailyQuest.quest_id == quest.id)
    )
    completion = existing.scalar_one_or_none()
    streak = await _get_or_create_streak(db, user.id)

    if completion is not None:
        return DailyQuestCompleteOut(
            completed=True,
            gained_xp=0,
            streak=streak.current_streak,
            shield_count=streak.shield_count,
        )

    db.add(UserDailyQuest(user_id=user.id, quest_id=quest.id))

    prev_date = streak.last_completed_date
    if prev_date is None:
        streak.current_streak = 1
    else:
        delta_days = (local_today - prev_date).days
        if delta_days <= 0:
            streak.current_streak = max(1, streak.current_streak)
        elif delta_days == 1:
            streak.current_streak += 1
        elif delta_days == 2 and streak.shield_count > 0:
            streak.shield_count -= 1
            streak.current_streak += 1
        else:
            streak.current_streak = 1

    if streak.current_streak > streak.longest_streak:
        streak.longest_streak = streak.current_streak

    # Reward a single streak shield once per 14-day cycle.
    if streak.current_streak > 0 and streak.current_streak % 14 == 0:
        if streak.last_shield_earned_at is None or (local_now - streak.last_shield_earned_at).days >= 14:
            streak.shield_count += 1
            streak.last_shield_earned_at = local_now

    streak.last_completed_date = local_today

    gained = await grant_xp(db, user, quest.xp_reward, reason="daily_quest_complete", payload={"quest_id": str(quest.id)})
    await record_event(
        db,
        user,
        "daily_quest_complete",
        {"quest_id": str(quest.id), "streak": streak.current_streak, "local_date": local_today.isoformat()},
    )
    await process_achievement_checks(db, user, "daily_quest_complete", {"streak": streak.current_streak})
    await create_notification(
        db,
        user.id,
        "daily_quest_ready",
        {"completed": True, "streak": streak.current_streak, "shield_count": streak.shield_count},
    )

    return DailyQuestCompleteOut(
        completed=True,
        gained_xp=gained,
        streak=streak.current_streak,
        shield_count=streak.shield_count,
    )


async def get_profile(db: AsyncSession, user: User) -> GamificationProfileOut:
    await ensure_gamification_catalog(db)
    levels = await _load_levels(db)
    level = _resolve_level(levels, user.xp)
    next_level = _next_level(levels, level.level)

    streak = await _get_or_create_streak(db, user.id)
    university = None
    if user.university_id:
        uni_result = await db.execute(select(University).where(University.id == user.university_id))
        uni = uni_result.scalar_one_or_none()
    else:
        uni = None
    if uni:
        university = UniversityMiniOut(
            id=uni.id,
            name=uni.name,
            short_code=uni.short_code,
        )

    return GamificationProfileOut(
        xp=user.xp,
        level=level.level,
        next_level_xp=next_level.xp_min if next_level else None,
        streak=streak.current_streak,
        university=university,
        rank_title=level.title,
        sound_enabled=user.sound_enabled,
    )


async def _progress_for_achievement(
    db: AsyncSession,
    user: User,
    achievement: Achievement,
    event_type: str | None,
    event_payload: dict | None,
) -> AchievementCheckResult:
    key = achievement.key

    if key == "awakening":
        result = await db.execute(
            select(func.count(AnalyticsEvent.id)).where(
                AnalyticsEvent.user_id == user.id,
                AnalyticsEvent.event_type == "skill_analysis",
            )
        )
        count = int(result.scalar() or 0)
        return AchievementCheckResult(unlocked=count >= 1, progress=min(1.0, count / 1.0))

    if key == "quantum_leap":
        result = await db.execute(
            select(func.count(distinct(UserPath.target_profession_id))).where(UserPath.user_id == user.id)
        )
        distinct_paths = int(result.scalar() or 0)
        return AchievementCheckResult(unlocked=distinct_paths >= 2, progress=min(1.0, distinct_paths / 2.0))

    if key == "relentless":
        streak = await _get_or_create_streak(db, user.id)
        return AchievementCheckResult(
            unlocked=streak.current_streak >= 7,
            progress=min(1.0, streak.current_streak / 7.0),
        )

    if key == "binary_mind":
        result = await db.execute(
            select(AnalyticsEvent.payload)
            .where(
                AnalyticsEvent.user_id == user.id,
                AnalyticsEvent.event_type == "simulation_complete",
            )
            .order_by(AnalyticsEvent.created_at.desc())
            .limit(30)
        )
        rows = result.scalars().all()
        unlocked = False
        for payload in rows:
            if not isinstance(payload, dict):
                continue
            is_hard = bool(payload.get("is_hard"))
            quality = int(payload.get("quality_score") or 0)
            if is_hard and quality >= 90:
                unlocked = True
                break
        return AchievementCheckResult(unlocked=unlocked, progress=1.0 if unlocked else 0.0)

    if key == "chaos_architect":
        result = await db.execute(
            select(AnalyticsEvent.payload)
            .where(AnalyticsEvent.user_id == user.id, AnalyticsEvent.event_type == "simulation_complete")
            .order_by(AnalyticsEvent.created_at.desc())
            .limit(50)
        )
        rows = result.scalars().all()
        unlocked = False
        for payload in rows:
            if not isinstance(payload, dict):
                continue
            profession_title = str(payload.get("profession_title") or "").lower()
            resolved = bool(payload.get("resolved_conflict"))
            if resolved and ("product" in profession_title or "hr" in profession_title):
                unlocked = True
                break
        return AchievementCheckResult(unlocked=unlocked, progress=1.0 if unlocked else 0.0)

    if key == "multiverse_explorer":
        result = await db.execute(
            select(AnalyticsEvent.payload)
            .where(AnalyticsEvent.user_id == user.id, AnalyticsEvent.event_type == "simulation_complete")
            .order_by(AnalyticsEvent.created_at.desc())
            .limit(100)
        )
        categories: set[str] = set()
        for payload in result.scalars().all():
            if not isinstance(payload, dict):
                continue
            category = str(payload.get("profession_category") or "").strip().lower()
            if category:
                categories.add(category)
        return AchievementCheckResult(unlocked=len(categories) >= 5, progress=min(1.0, len(categories) / 5.0))

    if key == "top_1_percent":
        now_utc = datetime.now(timezone.utc)
        week_start_date, _, _, _ = _week_window(now_utc)
        rank_result = await db.execute(
            select(LeaderboardStudentContribution.id)
            .join(
                LeaderboardWeeklySnapshot,
                LeaderboardStudentContribution.snapshot_id == LeaderboardWeeklySnapshot.id,
            )
            .where(
                LeaderboardStudentContribution.user_id == user.id,
                LeaderboardStudentContribution.rank == 1,
                LeaderboardWeeklySnapshot.week_start == week_start_date,
            )
            .limit(1)
        )
        unlocked = rank_result.scalar_one_or_none() is not None
        return AchievementCheckResult(unlocked=unlocked, progress=1.0 if unlocked else 0.0)

    if key == "deep_focus":
        result = await db.execute(
            select(AnalyticsEvent.created_at, AnalyticsEvent.payload)
            .where(AnalyticsEvent.user_id == user.id, AnalyticsEvent.event_type == "simulation_complete")
            .order_by(AnalyticsEvent.created_at.desc())
            .limit(100)
        )
        tz = _safe_tz(user.timezone)
        unlocked = False
        for created_at, payload in result.all():
            if not isinstance(payload, dict) or not bool(payload.get("is_hard")):
                continue
            local_hour = created_at.astimezone(tz).hour if created_at else 12
            if 0 <= local_hour < 5:
                unlocked = True
                break
        return AchievementCheckResult(unlocked=unlocked, progress=1.0 if unlocked else 0.0)

    if key == "grandmaster":
        profile = user.skill_profile or {}
        axes = [
            "communication",
            "leadership",
            "analytics",
            "creativity",
            "technical",
            "teamwork",
            "problem_solving",
            "time_management",
            "adaptability",
            "critical_thinking",
        ]
        score = 0
        for axis in axes:
            value = float(profile.get(axis) or 0.0)
            if value >= 0.8:
                score += 1
        return AchievementCheckResult(unlocked=score >= 10, progress=min(1.0, score / 10.0))

    if key == "evangelist":
        result = await db.execute(
            select(func.count(AnalyticsEvent.id)).where(
                AnalyticsEvent.user_id == user.id,
                AnalyticsEvent.event_type == "referral_success",
            )
        )
        count = int(result.scalar() or 0)
        return AchievementCheckResult(unlocked=count >= 3, progress=min(1.0, count / 3.0))

    return AchievementCheckResult(unlocked=False, progress=0.0)


async def _apply_achievement_reward(db: AsyncSession, user: User, achievement: Achievement) -> None:
    reward = achievement.reward_payload or {}

    bonus_xp = int(reward.get("xp") or 0)
    if bonus_xp > 0:
        await grant_xp(db, user, bonus_xp, reason=f"achievement:{achievement.key}")

    xp_multiplier = reward.get("xp_multiplier")
    if xp_multiplier is not None:
        duration = int(reward.get("duration_hours") or 24)
        user.xp_multiplier = max(1.0, float(xp_multiplier))
        user.xp_multiplier_until = datetime.now(timezone.utc) + timedelta(hours=duration)

    if bool(reward.get("elite_chat_access")):
        user.elite_chat_access = True


async def _unlock_achievement(db: AsyncSession, user: User, achievement: Achievement, progress: float) -> None:
    exists = await db.execute(
        select(UserAchievement.id).where(
            UserAchievement.user_id == user.id,
            UserAchievement.achievement_id == achievement.id,
        )
    )
    if exists.scalar_one_or_none() is not None:
        return

    db.add(
        UserAchievement(
            user_id=user.id,
            achievement_id=achievement.id,
            unlock_metadata={"progress": progress},
        )
    )

    await _apply_achievement_reward(db, user, achievement)
    await create_notification(
        db,
        user.id,
        "achievement_unlocked",
        {
            "key": achievement.key,
            "name": achievement.name,
            "rarity": achievement.rarity.value,
            "reward": achievement.reward_payload or {},
            "sound": "legendary" if achievement.rarity == AchievementRarity.LEGENDARY else "major",
        },
    )


async def process_achievement_checks(
    db: AsyncSession,
    user: User,
    event_type: str | None = None,
    event_payload: dict | None = None,
) -> None:
    await ensure_gamification_catalog(db)

    achievement_rows = await db.execute(select(Achievement).where(Achievement.is_active.is_(True)).order_by(Achievement.key.asc()))
    achievements = achievement_rows.scalars().all()

    unlocked_rows = await db.execute(
        select(UserAchievement.achievement_id).where(UserAchievement.user_id == user.id)
    )
    unlocked_ids = {row[0] for row in unlocked_rows.all()}

    for achievement in achievements:
        if achievement.id in unlocked_ids:
            continue
        result = await _progress_for_achievement(db, user, achievement, event_type, event_payload)
        if result.unlocked:
            await _unlock_achievement(db, user, achievement, result.progress)


async def list_achievements(db: AsyncSession, user: User) -> list[AchievementOut]:
    await process_achievement_checks(db, user)

    achievement_rows = await db.execute(select(Achievement).where(Achievement.is_active.is_(True)).order_by(Achievement.key.asc()))
    achievements = achievement_rows.scalars().all()

    unlocked_rows = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == user.id)
    )
    unlocked_map = {row.achievement_id: row for row in unlocked_rows.scalars().all()}

    items: list[AchievementOut] = []
    for achievement in achievements:
        check = await _progress_for_achievement(db, user, achievement, None, None)
        unlocked = unlocked_map.get(achievement.id)
        items.append(
            AchievementOut(
                key=achievement.key,
                name=achievement.name,
                rarity=achievement.rarity,
                unlocked=unlocked is not None,
                unlocked_at=unlocked.unlocked_at if unlocked else None,
                progress=1.0 if unlocked else check.progress,
                reward=achievement.reward_payload,
            )
        )

    return items


async def refresh_weekly_leaderboard(db: AsyncSession, now_utc: datetime | None = None) -> None:
    await ensure_gamification_catalog(db)
    now_utc = now_utc or datetime.now(timezone.utc)
    week_start_date, week_end_date, week_start_dt, week_end_dt = _week_window(now_utc)

    users_result = await db.execute(select(User).where(User.university_id.isnot(None)))
    users = users_result.scalars().all()
    if not users:
        return

    user_ids = [user.id for user in users]

    events_result = await db.execute(
        select(AnalyticsEvent.user_id, AnalyticsEvent.event_type, AnalyticsEvent.payload)
        .where(
            and_(
                AnalyticsEvent.user_id.in_(user_ids),
                AnalyticsEvent.created_at >= week_start_dt,
                AnalyticsEvent.created_at <= week_end_dt,
            )
        )
        .order_by(AnalyticsEvent.created_at.asc())
    )

    user_scores: dict[uuid.UUID, dict[str, float]] = {
        user.id: {
            "weekly_xp": 0.0,
            "achievement_points": 0.0,
            "streak_points": 0.0,
            "simulation_mastery_points": 0.0,
            "total_score": 0.0,
        }
        for user in users
    }

    for user_id, event_type, payload in events_result.all():
        if user_id not in user_scores:
            continue
        record = user_scores[user_id]
        if event_type == "xp_gained" and isinstance(payload, dict):
            record["weekly_xp"] += float(payload.get("gained_xp") or 0)
        if event_type == "simulation_complete" and isinstance(payload, dict):
            if bool(payload.get("is_hard")) and int(payload.get("quality_score") or 0) >= 90:
                record["simulation_mastery_points"] += 20.0

    achievement_rows = await db.execute(
        select(UserAchievement.user_id, Achievement.rarity)
        .join(Achievement, UserAchievement.achievement_id == Achievement.id)
        .where(
            and_(
                UserAchievement.user_id.in_(user_ids),
                UserAchievement.unlocked_at >= week_start_dt,
                UserAchievement.unlocked_at <= week_end_dt,
            )
        )
    )
    for user_id, rarity in achievement_rows.all():
        if user_id in user_scores:
            user_scores[user_id]["achievement_points"] += float(RARITY_POINTS.get(rarity, 0))

    streak_rows = await db.execute(select(UserStreak).where(UserStreak.user_id.in_(user_ids)))
    streak_map = {row.user_id: row for row in streak_rows.scalars().all()}

    for user in users:
        streak = streak_map.get(user.id)
        streak_days = streak.current_streak if streak else 0
        user_scores[user.id]["streak_points"] = float(min(streak_days, 14) * 5)

    for user_id, score in user_scores.items():
        score["total_score"] = (
            score["weekly_xp"]
            + score["achievement_points"]
            + score["streak_points"]
            + score["simulation_mastery_points"]
        )

    prev_week_start = week_start_date - timedelta(days=7)
    prev_rows = await db.execute(
        select(LeaderboardWeeklySnapshot.university_id, LeaderboardWeeklySnapshot.rank).where(
            LeaderboardWeeklySnapshot.week_start == prev_week_start
        )
    )
    previous_rank = {row[0]: row[1] for row in prev_rows.all()}

    await db.execute(delete(LeaderboardStudentContribution).where(
        LeaderboardStudentContribution.snapshot_id.in_(
            select(LeaderboardWeeklySnapshot.id).where(LeaderboardWeeklySnapshot.week_start == week_start_date)
        )
    ))
    await db.execute(delete(LeaderboardWeeklySnapshot).where(LeaderboardWeeklySnapshot.week_start == week_start_date))

    uni_map: dict[uuid.UUID, list[tuple[User, dict[str, float]]]] = {}
    for user in users:
        if user.university_id is None:
            continue
        uni_map.setdefault(user.university_id, []).append((user, user_scores[user.id]))

    university_rows = await db.execute(select(University).where(University.id.in_(list(uni_map.keys()))))
    universities = {item.id: item for item in university_rows.scalars().all()}

    university_scores: list[tuple[uuid.UUID, float, list[tuple[User, dict[str, float]]]]] = []
    for university_id, items in uni_map.items():
        ranked = sorted(items, key=lambda x: x[1]["total_score"], reverse=True)
        top50 = ranked[:50]
        total = sum(item[1]["total_score"] for item in top50)
        university_scores.append((university_id, total, top50))

    university_scores.sort(key=lambda x: x[1], reverse=True)

    for rank, (university_id, score, top50) in enumerate(university_scores, start=1):
        snapshot = LeaderboardWeeklySnapshot(
            week_start=week_start_date,
            week_end=week_end_date,
            university_id=university_id,
            score=score,
            rank=rank,
            delta=(previous_rank.get(university_id) - rank) if previous_rank.get(university_id) else None,
        )
        db.add(snapshot)
        await db.flush()

        for user_rank, (user, metrics) in enumerate(top50, start=1):
            db.add(
                LeaderboardStudentContribution(
                    snapshot_id=snapshot.id,
                    user_id=user.id,
                    university_id=university_id,
                    weekly_xp=int(round(metrics["weekly_xp"])),
                    achievement_points=int(round(metrics["achievement_points"])),
                    streak_points=int(round(metrics["streak_points"])),
                    simulation_mastery_points=int(round(metrics["simulation_mastery_points"])),
                    total_score=metrics["total_score"],
                    rank=user_rank,
                )
            )

        if top50:
            winner = top50[0][0]
            await process_achievement_checks(db, winner, "leaderboard_update", {"rank": 1, "university_id": str(university_id)})
            await create_notification(
                db,
                winner.id,
                "leaderboard_update",
                {
                    "rank": 1,
                    "university": universities.get(university_id).name if universities.get(university_id) else "",
                    "week_start": week_start_date.isoformat(),
                },
            )


async def get_weekly_leaderboard(db: AsyncSession) -> list[UniversityLeaderboardEntryOut]:
    await refresh_weekly_leaderboard(db)
    now_utc = datetime.now(timezone.utc)
    week_start_date, _, _, _ = _week_window(now_utc)

    rows = await db.execute(
        select(
            LeaderboardWeeklySnapshot.university_id,
            University.name,
            LeaderboardWeeklySnapshot.score,
            LeaderboardWeeklySnapshot.rank,
            LeaderboardWeeklySnapshot.delta,
        )
        .join(University, University.id == LeaderboardWeeklySnapshot.university_id)
        .where(LeaderboardWeeklySnapshot.week_start == week_start_date)
        .order_by(LeaderboardWeeklySnapshot.rank.asc())
    )

    return [
        UniversityLeaderboardEntryOut(
            university_id=row[0],
            university_name=row[1],
            score=float(row[2]),
            rank=int(row[3]),
            delta=row[4],
        )
        for row in rows.all()
    ]


async def get_notifications(
    db: AsyncSession,
    user: User,
    since: datetime | None = None,
    limit: int = 100,
) -> list[GamificationNotificationOut]:
    query = select(GamificationNotification).where(GamificationNotification.user_id == user.id)
    if since is not None:
        query = query.where(GamificationNotification.created_at > since)
    query = query.order_by(GamificationNotification.created_at.asc()).limit(max(1, min(limit, 200)))

    result = await db.execute(query)
    return [GamificationNotificationOut.model_validate(item) for item in result.scalars().all()]


async def get_career_card(db: AsyncSession, user: User) -> CareerIdentityCardOut:
    profile = await get_profile(db, user)

    unlocked_rows = await db.execute(
        select(Achievement.name)
        .join(UserAchievement, UserAchievement.achievement_id == Achievement.id)
        .where(UserAchievement.user_id == user.id)
        .order_by(UserAchievement.unlocked_at.desc())
        .limit(3)
    )
    badges = [row[0] for row in unlocked_rows.all()]

    rank = "Bronze"
    if profile.level >= 10:
        rank = "Platinum"
    elif profile.level >= 7:
        rank = "Gold"
    elif profile.level >= 4:
        rank = "Silver"

    return CareerIdentityCardOut(
        student_name=user.full_name,
        title=profile.rank_title,
        rank=rank,
        level=profile.level,
        xp=profile.xp,
        skill_profile=user.skill_profile or {},
        top_badges=badges,
    )


async def handle_domain_event(db: AsyncSession, user: User, event_type: str, payload: dict | None = None) -> None:
    await record_event(db, user, event_type, payload)
    await process_achievement_checks(db, user, event_type, payload)
