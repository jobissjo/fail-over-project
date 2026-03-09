from fastapi import APIRouter, Depends, status

from app.core.auth import get_current_user, require_admin
from app.models.user import User
from app.schemas.media_request import MediaRequestAdminPatch, MediaRequestCreate, MediaRequestOut
from app.services.media_request_service import MediaRequestService

router = APIRouter(prefix="/api/media-requests", tags=["media-requests"])


@router.post("/", response_model=MediaRequestOut, status_code=status.HTTP_201_CREATED)
async def create_request(payload: MediaRequestCreate, current_user: User = Depends(get_current_user)):
    return await MediaRequestService().create(current_user.id, payload)


@router.get("/me", response_model=list[MediaRequestOut])
async def list_my_requests(current_user: User = Depends(get_current_user)):
    return await MediaRequestService().list_for_user(current_user.id)


@router.get("/", response_model=list[MediaRequestOut], dependencies=[Depends(require_admin)])
async def list_all_requests():
    return await MediaRequestService().list_all()


@router.patch("/{request_id}", response_model=MediaRequestOut, dependencies=[Depends(require_admin)])
async def admin_update_request(request_id: int, payload: MediaRequestAdminPatch):
    return await MediaRequestService().admin_patch(request_id, payload)
