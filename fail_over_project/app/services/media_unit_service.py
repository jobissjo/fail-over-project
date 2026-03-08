from fastapi import HTTPException, status

from app.repositories.media_unit_repository import MediaUnitRepository
from app.schemas.media_unit import MediaUnitCreate, MediaUnitUpdate


class MediaUnitService:
    def __init__(self, repo: MediaUnitRepository | None = None):
        self.repo = repo or MediaUnitRepository()

    async def list(self, *, media_id: int | None = None):
        return await self.repo.list(media_id=media_id)

    async def create(self, data: MediaUnitCreate):
        return await self.repo.create(media_id=data.media_id, number=data.number, title=data.title)

    async def update(self, unit_id: int, data: MediaUnitUpdate):
        unit = await self.repo.get(unit_id)
        if not unit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MediaUnit not found")
        return await self.repo.update(unit, media_id=data.media_id, number=data.number, title=data.title)

    async def delete(self, unit_id: int) -> None:
        unit = await self.repo.get(unit_id)
        if not unit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MediaUnit not found")
        await self.repo.delete(unit)
