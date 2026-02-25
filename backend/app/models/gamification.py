import enum
import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AchievementRarity(str, enum.Enum):
    COMMON = "common"
    UNCOMMON = "uncommon"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"


class QuestType(str, enum.Enum):
    MICRO_REFLECTION = "micro_reflection"
    ONE_DECISION_SIM = "one_decision_sim"
    SKILL_FLASH = "skill_flash"
    PIVOT_CHECK = "pivot_check"


class GamificationLevel(Base):
    __tablename__ = "gamification_levels"

    level: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    xp_min: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    xp_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ui_upgrade: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    rarity: Mapped[AchievementRarity] = mapped_column(
        Enum(
            AchievementRarity,
            values_callable=lambda obj: [item.value for item in obj],
            name="achievementrarity",
        ),
        nullable=False,
    )
    condition_type: Mapped[str] = mapped_column(String(120), nullable=False)
    condition_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    reward_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    season: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user_achievements: Mapped[list["UserAchievement"]] = relationship(back_populates="achievement", lazy="noload")


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    __table_args__ = (UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement_unique"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    achievement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False, index=True
    )
    unlocked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    unlock_metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    user: Mapped["User"] = relationship(back_populates="user_achievements")  # noqa: F821
    achievement: Mapped[Achievement] = relationship(back_populates="user_achievements")


class DailyQuest(Base):
    __tablename__ = "daily_quests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quest_date: Mapped[date] = mapped_column(Date, unique=True, nullable=False, index=True)
    quest_type: Mapped[QuestType] = mapped_column(
        Enum(
            QuestType,
            values_callable=lambda obj: [item.value for item in obj],
            name="questtype",
        ),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    xp_reward: Mapped[int] = mapped_column(Integer, default=25, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    completions: Mapped[list["UserDailyQuest"]] = relationship(back_populates="quest", lazy="noload")


class UserDailyQuest(Base):
    __tablename__ = "user_daily_quests"
    __table_args__ = (UniqueConstraint("user_id", "quest_id", name="uq_user_daily_quest_unique"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    quest_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("daily_quests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship(back_populates="daily_quest_completions")  # noqa: F821
    quest: Mapped[DailyQuest] = relationship(back_populates="completions")


class UserStreak(Base):
    __tablename__ = "user_streaks"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_completed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    shield_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_shield_earned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="streak")  # noqa: F821


class LeaderboardWeeklySnapshot(Base):
    __tablename__ = "leaderboard_weekly_snapshots"
    __table_args__ = (UniqueConstraint("week_start", "university_id", name="uq_weekly_leaderboard_university"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    week_start: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    week_end: Mapped[date] = mapped_column(Date, nullable=False)
    university_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    rank: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    delta: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    university: Mapped["University"] = relationship(back_populates="weekly_snapshots")  # noqa: F821
    contributions: Mapped[list["LeaderboardStudentContribution"]] = relationship(
        back_populates="snapshot",
        cascade="all, delete-orphan",
        lazy="noload",
    )


class LeaderboardStudentContribution(Base):
    __tablename__ = "leaderboard_student_contributions"
    __table_args__ = (UniqueConstraint("snapshot_id", "user_id", name="uq_snapshot_user_contribution"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    snapshot_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leaderboard_weekly_snapshots.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    university_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    weekly_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    achievement_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    streak_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    simulation_mastery_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    rank: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    snapshot: Mapped[LeaderboardWeeklySnapshot] = relationship(back_populates="contributions")
    user: Mapped["User"] = relationship(back_populates="leaderboard_contributions")  # noqa: F821


class GamificationNotification(Base):
    __tablename__ = "gamification_notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)

    user: Mapped["User"] = relationship(back_populates="gamification_notifications")  # noqa: F821
