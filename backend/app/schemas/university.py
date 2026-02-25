import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class UniversityOut(BaseModel):
    id: uuid.UUID
    name: str
    short_code: str
    region: str | None = None
    logo_url: str | None = None
    is_active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class UniversityCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    short_code: str = Field(min_length=2, max_length=32)
    region: str | None = Field(default=None, max_length=120)
    logo_url: str | None = Field(default=None, max_length=500)
    is_active: bool = True


class UniversityUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    short_code: str | None = Field(default=None, min_length=2, max_length=32)
    region: str | None = Field(default=None, max_length=120)
    logo_url: str | None = Field(default=None, max_length=500)
    is_active: bool | None = None
