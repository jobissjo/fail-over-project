from fastapi import APIRouter, Depends, status

from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.progress import ProgressStatusPatch, ProgressUpsert, UserMediaProgressOut
from app.services.progress_service import ProgressService

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/", response_model=list[UserMediaProgressOut])
async def list_my_progress(current_user: User = Depends(get_current_user)):
    return await ProgressService().list_for_user(current_user.id)


@router.post("/", response_model=UserMediaProgressOut)
async def upsert_progress(payload: ProgressUpsert, current_user: User = Depends(get_current_user)):
    return await ProgressService().upsert(current_user.id, payload)


@router.patch("/{progress_id}", response_model=UserMediaProgressOut)
async def patch_progress_status(progress_id: int, payload: ProgressStatusPatch, current_user: User = Depends(get_current_user)):
    return await ProgressService().patch_status(current_user.id, progress_id, payload)


@router.delete("/{progress_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_progress(progress_id: int, current_user: User = Depends(get_current_user)):
    await ProgressService().delete(current_user.id, progress_id)
    return None
