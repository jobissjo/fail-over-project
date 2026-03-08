from fastapi import HTTPException, status

from app.repositories.media_type_repository import MediaTypeRepository
from app.schemas.media_type import MediaTypeCreate, MediaTypeUpdate


class MediaTypeService:
    def __init__(self, repo: MediaTypeRepository | None = None):
        self.repo = repo or MediaTypeRepository()

    async def list(self):
        return await self.repo.list()

    async def create(self, data: MediaTypeCreate):
        return await self.repo.create(name=data.name, structure=data.structure)

    async def update(self, media_type_id: int, data: MediaTypeUpdate):
        media_type = await self.repo.get(media_type_id)
        if not media_type:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MediaType not found")
        return await self.repo.update(media_type, name=data.name, structure=data.structure)

    async def delete(self, media_type_id: int) -> None:
        media_type = await self.repo.get(media_type_id)
        if not media_type:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MediaType not found")
        await self.repo.delete(media_type)
