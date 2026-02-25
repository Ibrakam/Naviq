import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.client import invalidate_prompt_cache
from app.database import get_db
from app.dependencies import require_admin
from app.models.ai_prompt import AIPrompt
from app.models.user import User

router = APIRouter(prefix="/prompts", tags=["admin-prompts"])


class PromptOut(BaseModel):
    id: uuid.UUID
    name: str
    system_prompt: str
    model: str
    temperature: float

    model_config = {"from_attributes": True}


class PromptCreate(BaseModel):
    name: str
    system_prompt: str
    model: str = "gpt-4o"
    temperature: float = 0.7


class PromptUpdate(BaseModel):
    system_prompt: str | None = None
    model: str | None = None
    temperature: float | None = None


@router.get("/", response_model=list[PromptOut])
async def list_prompts(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AIPrompt))
    return result.scalars().all()


@router.post("/", response_model=PromptOut, status_code=status.HTTP_201_CREATED)
async def create_prompt(
    body: PromptCreate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    prompt = AIPrompt(**body.model_dump())
    db.add(prompt)
    await db.flush()
    return prompt


@router.patch("/{prompt_id}", response_model=PromptOut)
async def update_prompt(
    prompt_id: uuid.UUID,
    body: PromptUpdate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AIPrompt).where(AIPrompt.id == prompt_id))
    prompt = result.scalar_one_or_none()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(prompt, field, value)

    await db.flush()
    await invalidate_prompt_cache(prompt.name)
    return prompt


@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prompt(
    prompt_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AIPrompt).where(AIPrompt.id == prompt_id))
    prompt = result.scalar_one_or_none()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    await invalidate_prompt_cache(prompt.name)
    await db.delete(prompt)
