from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.i18n.locale import normalize_locale
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_me(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
):
    update_data = body.model_dump(exclude_unset=True)
    if "preferred_language" in update_data and update_data["preferred_language"] is not None:
        update_data["preferred_language"] = normalize_locale(update_data["preferred_language"])
    for field, value in update_data.items():
        setattr(current_user, field, value)
    return current_user
