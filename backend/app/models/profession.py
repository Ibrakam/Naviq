import uuid

from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Profession(Base):
    __tablename__ = "professions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=True, index=True)
    reference_skills: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    simulations: Mapped[list["Simulation"]] = relationship(back_populates="profession", lazy="selectin")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Profession {self.title}>"
