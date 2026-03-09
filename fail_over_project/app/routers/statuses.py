from fastapi import APIRouter, Depends, status

from app.core.auth import require_admin
from app.schemas.status import StatusCreate, StatusOut, StatusUpdate
from app.services.status_service import StatusService

router = APIRouter(prefix="/api/status", tags=["status"])


@router.get("/", response_model=list[StatusOut])
async def list_statuses():
    return await StatusService().list()


@router.post("/", response_model=StatusOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_status(payload: StatusCreate):
    return await StatusService().create(payload)


@router.put("/{status_id}", response_model=StatusOut, dependencies=[Depends(require_admin)])
async def update_status(status_id: int, payload: StatusUpdate):
    return await StatusService().update(status_id, payload)


@router.delete("/{status_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_status(status_id: int):
    await StatusService().delete(status_id)
    return None
