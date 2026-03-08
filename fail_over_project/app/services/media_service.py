from fastapi import HTTPException, status

from app.repositories.media_repository import MediaRepository
from app.schemas.media import MediaCreate, MediaUpdate


class MediaService:
    def __init__(self, repo: MediaRepository | None = None):
        self.repo = repo or MediaRepository()

    async def list(self, *, offset: int, limit: int):
        return await self.repo.list(offset=offset, limit=limit)

    async def get(self, media_id: int):
        media_obj = await self.repo.get(media_id)
        if not media_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
        return media_obj

    async def create(self, data: MediaCreate):
        return await self.repo.create(
            title=data.title,
            image=data.image,
            media_type_id=data.media_type_id,
            total_series=data.total_series,
            description=data.description,
        )

    async def update(self, media_id: int, data: MediaUpdate):
        media_obj = await self.repo.get(media_id)
        if not media_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
        return await self.repo.update(
            media_obj,
            title=data.title,
            image=data.image,
            media_type_id=data.media_type_id,
            total_series=data.total_series,
            description=data.description,
        )

    async def delete(self, media_id: int) -> None:
        media_obj = await self.repo.get(media_id)
        if not media_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
        await self.repo.delete(media_obj)
