from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.user import User
from app.services.analytics_service import (
    get_conversion_funnel,
    get_simulation_dropoff,
    get_skill_heatmap,
    get_top_careers,
)

router = APIRouter(prefix="/analytics", tags=["admin-analytics"])


@router.get("/skill-heatmap")
async def skill_heatmap(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await get_skill_heatmap(db)


@router.get("/conversion")
async def conversion(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await get_conversion_funnel(db)


@router.get("/top-careers")
async def top_careers(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await get_top_careers(db)


@router.get("/dropoff")
async def dropoff(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await get_simulation_dropoff(db)
