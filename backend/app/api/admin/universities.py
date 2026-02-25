import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.university import University
from app.models.user import User
from app.schemas.university import UniversityCreate, UniversityOut, UniversityUpdate

router = APIRouter(prefix="/universities", tags=["admin-universities"])


@router.get("/", response_model=list[UniversityOut])
async def list_universities(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(University).offset(skip).limit(limit).order_by(University.name.asc()))
    return result.scalars().all()


@router.post("/", response_model=UniversityOut, status_code=status.HTTP_201_CREATED)
async def create_university(
    body: UniversityCreate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    item = University(
        name=body.name.strip(),
        short_code=body.short_code.strip().upper(),
        region=body.region.strip() if body.region else None,
        logo_url=body.logo_url.strip() if body.logo_url else None,
        is_active=body.is_active,
    )
    db.add(item)
    await db.flush()
    return item


@router.get("/{university_id}", response_model=UniversityOut)
async def get_university(
    university_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    item = await db.get(University, university_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="University not found")
    return item


@router.patch("/{university_id}", response_model=UniversityOut)
async def update_university(
    university_id: uuid.UUID,
    body: UniversityUpdate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    item = await db.get(University, university_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="University not found")

    changes = body.model_dump(exclude_unset=True)
    if "name" in changes and changes["name"] is not None:
        changes["name"] = changes["name"].strip()
    if "short_code" in changes and changes["short_code"] is not None:
        changes["short_code"] = changes["short_code"].strip().upper()
    if "region" in changes and isinstance(changes["region"], str):
        changes["region"] = changes["region"].strip() or None
    if "logo_url" in changes and isinstance(changes["logo_url"], str):
        changes["logo_url"] = changes["logo_url"].strip() or None

    for field, value in changes.items():
        setattr(item, field, value)

    await db.flush()
    return item


@router.delete("/{university_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_university(
    university_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    item = await db.get(University, university_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="University not found")
    await db.delete(item)
