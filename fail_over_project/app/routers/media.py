from fastapi import APIRouter, Depends, Query, status

from app.core.auth import require_admin
from app.schemas.media import MediaCreate, MediaOut, MediaUpdate
from app.services.media_service import MediaService
from app.utils.pagination import Page, PageMeta

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/", response_model=Page)
async def list_media(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100)):
    service = MediaService()
    offset = (page - 1) * size
    items, total = await service.list(offset=offset, limit=size)
    return Page(items=[MediaOut.model_validate(i) for i in items], meta=PageMeta(page=page, size=size, total=total))


@router.get("/{media_id}", response_model=MediaOut)
async def get_media(media_id: int):
    return await MediaService().get(media_id)


@router.post("/", response_model=MediaOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_media(payload: MediaCreate):
    return await MediaService().create(payload)


@router.put("/{media_id}", response_model=MediaOut, dependencies=[Depends(require_admin)])
async def update_media(media_id: int, payload: MediaUpdate):
    return await MediaService().update(media_id, payload)


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_media(media_id: int):
    await MediaService().delete(media_id)
    return None
