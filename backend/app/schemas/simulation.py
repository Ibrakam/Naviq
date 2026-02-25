import uuid

from pydantic import BaseModel

from app.models.simulation import StepType


class SimulationStepOut(BaseModel):
    id: uuid.UUID
    order: int
    type: StepType
    content: dict
    next_step_rules: dict | None = None

    model_config = {"from_attributes": True}


class SimulationOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None = None
    profession_id: uuid.UUID
    is_active: bool
    steps: list[SimulationStepOut] = []

    model_config = {"from_attributes": True}


class SimulationStepCreate(BaseModel):
    order: int
    type: StepType
    content: dict
    next_step_rules: dict | None = None


class SimulationCreate(BaseModel):
    title: str
    description: str | None = None
    profession_id: uuid.UUID
    is_active: bool = True
    steps: list[SimulationStepCreate] = []


class SimulationUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    is_active: bool | None = None


class StepAnswerRequest(BaseModel):
    answer: str


class SimulationSessionState(BaseModel):
    simulation_id: uuid.UUID
    current_step_order: int
    answers: list[dict] = []
    completed: bool = False


class SimulationStepResponse(BaseModel):
    step: SimulationStepOut | None = None
    session: SimulationSessionState
    finished: bool = False
    skill_update: dict | None = None
