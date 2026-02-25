import uuid

from sqlalchemy import Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    provider: Mapped[str] = mapped_column(String(100), nullable=False, default="Naviq")
    url: Mapped[str | None] = mapped_column(Text, nullable=True)
    skill_tags: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    difficulty: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    lessons: Mapped[list["CourseLesson"]] = relationship(  # noqa: F821
        back_populates="course",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Course {self.title} ({self.provider})>"
