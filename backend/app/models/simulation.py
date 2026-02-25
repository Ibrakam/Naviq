import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class StepType(str, enum.Enum):
    QUESTION = "question"
    TASK = "task"
    DIALOG = "dialog"


class Simulation(Base):
    __tablename__ = "simulations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    profession_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("professions.id"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    profession = relationship("Profession", back_populates="simulations", lazy="selectin")
    steps: Mapped[list["SimulationStep"]] = relationship(
        back_populates="simulation", lazy="selectin", order_by="SimulationStep.order"
    )

    def __repr__(self) -> str:
        return f"<Simulation {self.title}>"


class SimulationStep(Base):
    __tablename__ = "simulation_steps"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    simulation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("simulations.id", ondelete="CASCADE"), nullable=False
    )
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[StepType] = mapped_column(Enum(StepType), nullable=False)
    content: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    next_step_rules: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    simulation = relationship("Simulation", back_populates="steps")

    def __repr__(self) -> str:
        return f"<SimulationStep sim={self.simulation_id} order={self.order}>"
