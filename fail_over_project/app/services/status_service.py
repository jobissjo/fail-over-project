from fastapi import HTTPException, status

from app.repositories.status_repository import StatusRepository
from app.schemas.status import StatusCreate, StatusUpdate


class StatusService:
    def __init__(self, repo: StatusRepository | None = None):
        self.repo = repo or StatusRepository()

    async def list(self):
        return await self.repo.list()

    async def create(self, data: StatusCreate):
        return await self.repo.create(
            name=data.name,
            category=data.category,
            order=data.order,
            media_type_id=data.media_type_id,
        )

    async def update(self, status_id: int, data: StatusUpdate):
        status_obj = await self.repo.get(status_id)
        if not status_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Status not found")
        return await self.repo.update(
            status_obj,
            name=data.name,
            category=data.category,
            order=data.order,
            media_type_id=data.media_type_id,
        )

    async def delete(self, status_id: int) -> None:
        status_obj = await self.repo.get(status_id)
        if not status_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Status not found")
        await self.repo.delete(status_obj)
