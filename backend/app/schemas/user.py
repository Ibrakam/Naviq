import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    xp: int
    xp_multiplier: float = 1.0
    attempts_balance: int
    skill_profile: dict | None = None
    preferred_language: Literal["ru", "uz"] = "ru"
    timezone: str
    sound_enabled: bool
    elite_chat_access: bool
    university_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: str | None = None
    skill_profile: dict | None = None
    preferred_language: Literal["ru", "uz"] | None = None
    timezone: str | None = None
    sound_enabled: bool | None = None
    university_id: uuid.UUID | None = None


class AdminUserUpdate(BaseModel):
    full_name: str | None = None
    role: UserRole | None = None
    xp: int | None = None
    attempts_balance: int | None = None
    skill_profile: dict | None = None
    preferred_language: Literal["ru", "uz"] | None = None
    timezone: str | None = None
    sound_enabled: bool | None = None
    university_id: uuid.UUID | None = None
    elite_chat_access: bool | None = None
