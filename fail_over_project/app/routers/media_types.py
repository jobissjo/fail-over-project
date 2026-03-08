from fastapi import APIRouter, Depends, status

from app.core.auth import require_admin
from app.schemas.media_type import MediaTypeCreate, MediaTypeOut, MediaTypeUpdate
from app.services.media_type_service import MediaTypeService

router = APIRouter(prefix="/media-types", tags=["media-types"])


@router.get("/", response_model=list[MediaTypeOut])
async def list_media_types():
    return await MediaTypeService().list()


@router.post("/", response_model=MediaTypeOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_media_type(payload: MediaTypeCreate):
    return await MediaTypeService().create(payload)


@router.put("/{media_type_id}", response_model=MediaTypeOut, dependencies=[Depends(require_admin)])
async def update_media_type(media_type_id: int, payload: MediaTypeUpdate):
    return await MediaTypeService().update(media_type_id, payload)


@router.delete("/{media_type_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_media_type(media_type_id: int):
    await MediaTypeService().delete(media_type_id)
    return None
