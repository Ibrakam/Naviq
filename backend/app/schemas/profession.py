import uuid

from pydantic import BaseModel


class ProfessionOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None = None
    category: str | None = None
    reference_skills: dict

    model_config = {"from_attributes": True}


class ProfessionCreate(BaseModel):
    title: str
    description: str | None = None
    category: str | None = None
    reference_skills: dict


class ProfessionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    reference_skills: dict | None = None
