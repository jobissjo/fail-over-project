from fastapi import HTTPException, status

from app.repositories.media_request_repository import MediaRequestRepository
from app.schemas.media_request import MediaRequestAdminPatch, MediaRequestCreate


class MediaRequestService:
    def __init__(self, repo: MediaRequestRepository | None = None):
        self.repo = repo or MediaRequestRepository()

    async def create(self, user_id: int, data: MediaRequestCreate):
        return await self.repo.create(
            user_id=user_id,
            request_type=data.request_type,
            media_id=data.media_id,
            title=data.title,
            description=data.description,
            media_type_id=data.media_type_id,
        )

    async def list_for_user(self, user_id: int):
        return await self.repo.list_for_user(user_id)

    async def list_all(self):
        return await self.repo.list_all()

    async def admin_patch(self, request_id: int, data: MediaRequestAdminPatch):
        req = await self.repo.get(request_id)
        if not req:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MediaRequest not found")
        return await self.repo.update_admin(req, status=data.status, admin_note=data.admin_note)
