import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)

    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    xp_multiplier: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    xp_multiplier_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    attempts_balance: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    skill_profile: Mapped[dict | None] = mapped_column(JSONB, default=dict, nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(2), default="ru", nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), default="UTC", nullable=False)
    sound_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    elite_chat_access: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    university_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("universities.id", ondelete="SET NULL"), nullable=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    university = relationship("University", back_populates="users", lazy="selectin")
    paths: Mapped[list["UserPath"]] = relationship(back_populates="user", lazy="selectin")  # noqa: F821
    analytics_events: Mapped[list["AnalyticsEvent"]] = relationship(back_populates="user", lazy="noload")  # noqa: F821
    lesson_submissions: Mapped[list["LessonHomeworkSubmission"]] = relationship(  # noqa: F821
        lazy="noload",
        overlaps="user",
    )
    user_achievements: Mapped[list["UserAchievement"]] = relationship(  # noqa: F821
        back_populates="user",
        lazy="noload",
    )
    daily_quest_completions: Mapped[list["UserDailyQuest"]] = relationship(  # noqa: F821
        back_populates="user",
        lazy="noload",
    )
    streak: Mapped["UserStreak | None"] = relationship(back_populates="user", uselist=False, lazy="selectin")  # noqa: F821
    gamification_notifications: Mapped[list["GamificationNotification"]] = relationship(  # noqa: F821
        back_populates="user",
        lazy="noload",
    )
    leaderboard_contributions: Mapped[list["LeaderboardStudentContribution"]] = relationship(  # noqa: F821
        back_populates="user",
        lazy="noload",
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"
