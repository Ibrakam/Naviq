import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PathStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class UserPath(Base):
    __tablename__ = "user_paths"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    target_profession_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("professions.id"), nullable=False
    )

    steps: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)
    gap_analysis: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    status: Mapped[PathStatus] = mapped_column(Enum(PathStatus), default=PathStatus.ACTIVE, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", back_populates="paths")
    target_profession = relationship("Profession", lazy="selectin")

    def __repr__(self) -> str:
        return f"<UserPath user={self.user_id} status={self.status}>"
