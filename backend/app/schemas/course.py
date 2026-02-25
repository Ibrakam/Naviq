import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CourseOut(BaseModel):
    id: uuid.UUID
    title: str
    provider: str
    url: str | None = None
    skill_tags: dict
    difficulty: int
    description: str | None = None

    model_config = {"from_attributes": True}


class CourseCreate(BaseModel):
    title: str
    provider: str | None = "Naviq"
    url: str | None = None
    skill_tags: dict
    difficulty: int = 1
    description: str | None = None


class CourseUpdate(BaseModel):
    title: str | None = None
    provider: str | None = None
    url: str | None = None
    skill_tags: dict | None = None
    difficulty: int | None = None
    description: str | None = None


class HomeworkSubmissionCreate(BaseModel):
    answer: str = Field(min_length=10, max_length=12000)


class HomeworkSubmissionOut(BaseModel):
    id: uuid.UUID
    lesson_id: uuid.UUID
    user_id: uuid.UUID
    answer: str
    status: str
    score: int | None = None
    feedback: str | None = None
    created_at: datetime
    checked_at: datetime | None = None

    model_config = {"from_attributes": True}


class CourseLessonOut(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    order: int
    title: str
    description: str | None = None
    youtube_url: str | None = None
    homework_prompt: str | None = None
    homework_rubric: dict | None = None
    created_at: datetime
    updated_at: datetime
    my_latest_submission: HomeworkSubmissionOut | None = None

    model_config = {"from_attributes": True}


class CourseLessonCreate(BaseModel):
    order: int = Field(ge=1, le=1000)
    title: str = Field(min_length=2, max_length=255)
    description: str | None = None
    youtube_url: str | None = None
    homework_prompt: str | None = None
    homework_rubric: dict | None = None


class CourseLessonUpdate(BaseModel):
    order: int | None = Field(default=None, ge=1, le=1000)
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    youtube_url: str | None = None
    homework_prompt: str | None = None
    homework_rubric: dict | None = None
