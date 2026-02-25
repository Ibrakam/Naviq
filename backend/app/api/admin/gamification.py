from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.gamification import Achievement
from app.models.user import User
from app.schemas.gamification import AchievementAdminOut, AchievementAdminUpdate
from app.services.gamification_service import ensure_gamification_catalog

router = APIRouter(prefix="/gamification", tags=["admin-gamification"])


@router.get("/achievements", response_model=list[AchievementAdminOut])
async def admin_list_achievements(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    await ensure_gamification_catalog(db)
    rows = await db.execute(select(Achievement).order_by(Achievement.key.asc()))
    return rows.scalars().all()


@router.put("/achievements/{achievement_key}", response_model=AchievementAdminOut)
async def admin_update_achievement(
    achievement_key: str,
    body: AchievementAdminUpdate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    await ensure_gamification_catalog(db)
    row = await db.execute(select(Achievement).where(Achievement.key == achievement_key))
    achievement = row.scalar_one_or_none()
    if achievement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(achievement, field, value)

    await db.flush()
    return achievement
