import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.gamification import AchievementRarity, QuestType


class UniversityMiniOut(BaseModel):
    id: uuid.UUID
    name: str
    short_code: str


class GamificationLevelOut(BaseModel):
    level: int
    title: str
    xp_min: int
    xp_max: int | None = None
    ui_upgrade: str | None = None

    model_config = {"from_attributes": True}


class GamificationProfileOut(BaseModel):
    xp: int
    level: int
    next_level_xp: int | None = None
    streak: int = 0
    university: UniversityMiniOut | None = None
    rank_title: str
    sound_enabled: bool = True


class AchievementOut(BaseModel):
    key: str
    name: str
    rarity: AchievementRarity
    unlocked: bool
    unlocked_at: datetime | None = None
    progress: float = 0.0
    reward: dict | None = None


class DailyQuestOut(BaseModel):
    id: uuid.UUID
    quest_type: QuestType
    title: str
    prompt: str
    xp_reward: int
    completed: bool


class DailyQuestCompleteOut(BaseModel):
    completed: bool
    gained_xp: int
    streak: int
    shield_count: int


class UniversityLeaderboardEntryOut(BaseModel):
    university_id: uuid.UUID
    university_name: str
    score: float
    rank: int
    delta: int | None = None


class GamificationNotificationOut(BaseModel):
    id: uuid.UUID
    type: str
    payload: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CareerIdentityCardOut(BaseModel):
    student_name: str
    title: str
    rank: str
    level: int
    xp: int
    skill_profile: dict
    top_badges: list[str]


class AchievementAdminOut(BaseModel):
    key: str
    name: str
    rarity: AchievementRarity
    season: int
    is_active: bool
    reward_payload: dict | None = None

    model_config = {"from_attributes": True}


class AchievementAdminUpdate(BaseModel):
    season: int | None = Field(default=None, ge=1, le=100)
    is_active: bool | None = None
    reward_payload: dict | None = None
