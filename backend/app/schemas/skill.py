import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.models.user_path import PathStatus


class AnswerItem(BaseModel):
    question_id: str
    answer: str


class AnalyzeSkillsRequest(BaseModel):
    answers: list[AnswerItem]


class AssessmentOption(BaseModel):
    code: str
    text: str


class AssessmentQuestionOut(BaseModel):
    id: str
    question: str
    type: str = "multiple_choice"
    category: str | None = None
    required: bool = True
    options: list[AssessmentOption] = Field(default_factory=list)


class SkillVector(BaseModel):
    communication: float = 0.0
    leadership: float = 0.0
    analytics: float = 0.0
    creativity: float = 0.0
    technical: float = 0.0
    teamwork: float = 0.0
    problem_solving: float = 0.0
    time_management: float = 0.0
    adaptability: float = 0.0
    critical_thinking: float = 0.0

    model_config = {"from_attributes": True}


class GapAnalysisResponse(BaseModel):
    gaps: dict[str, float]
    match_percentage: float
    profession_id: uuid.UUID
    profession_title: str


class GeneratePathRequest(BaseModel):
    profession_id: uuid.UUID


class RoadmapTaskStatusResponse(BaseModel):
    task_id: str
    status: Literal["processing", "ok", "failed"]
    path_id: uuid.UUID | None = None
    error: str | None = None


class UserPathOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    target_profession_id: uuid.UUID
    steps: list[dict] = []
    gap_analysis: dict | None = None
    status: PathStatus
    created_at: datetime
    updated_at: datetime
    profession_title: str | None = None

    model_config = {"from_attributes": True}
