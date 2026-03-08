from fastapi import APIRouter, Depends, Query, status

from app.core.auth import require_admin
from app.schemas.media_unit import MediaUnitCreate, MediaUnitOut, MediaUnitUpdate
from app.services.media_unit_service import MediaUnitService

router = APIRouter(prefix="/media-units", tags=["media-units"])


@router.get("/", response_model=list[MediaUnitOut])
async def list_units(media_id: int | None = Query(default=None)):
    return await MediaUnitService().list(media_id=media_id)


@router.post("/", response_model=MediaUnitOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_unit(payload: MediaUnitCreate):
    return await MediaUnitService().create(payload)


@router.put("/{unit_id}", response_model=MediaUnitOut, dependencies=[Depends(require_admin)])
async def update_unit(unit_id: int, payload: MediaUnitUpdate):
    return await MediaUnitService().update(unit_id, payload)


@router.delete("/{unit_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_unit(unit_id: int):
    await MediaUnitService().delete(unit_id)
    return None
