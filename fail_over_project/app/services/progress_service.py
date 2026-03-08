from fastapi import HTTPException, status

from app.repositories.progress_repository import ProgressRepository
from app.schemas.progress import ProgressStatusPatch, ProgressUpsert


class ProgressService:
    def __init__(self, repo: ProgressRepository | None = None):
        self.repo = repo or ProgressRepository()

    async def list_for_user(self, user_id: int):
        return await self.repo.list_for_user(user_id)

    async def upsert(self, user_id: int, data: ProgressUpsert):
        existing = await self.repo.get_for_user_and_media(user_id=user_id, media_id=data.media_id)
        if existing:
            return await self.repo.update(
                existing,
                status_id=data.status_id,
                unit_id=data.unit_id,
                completed=data.completed,
            )
        return await self.repo.create(
            user_id=user_id,
            media_id=data.media_id,
            status_id=data.status_id,
            unit_id=data.unit_id,
            completed=data.completed,
        )

    async def patch_status(self, user_id: int, progress_id: int, data: ProgressStatusPatch):
        progress = await self.repo.get(progress_id)
        if not progress or progress.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Progress not found")
        return await self.repo.update(progress, status_id=data.status_id)

    async def delete(self, user_id: int, progress_id: int) -> None:
        progress = await self.repo.get(progress_id)
        if not progress or progress.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Progress not found")
        await self.repo.delete(progress)
