from app.models.media_request import MediaRequest


class MediaRequestRepository:
    async def create(
        self,
        *,
        user_id: int,
        request_type,
        media_id: int | None,
        title: str,
        description: str | None,
        media_type_id: int | None,
    ) -> MediaRequest:
        return await MediaRequest.create(
            user_id=user_id,
            request_type=request_type,
            media_id=media_id,
            title=title,
            description=description,
            media_type_id=media_type_id,
        )

    async def list_for_user(self, user_id: int) -> list[MediaRequest]:
        return await MediaRequest.filter(user_id=user_id).order_by("-created_at")

    async def list_all(self) -> list[MediaRequest]:
        return await MediaRequest.all().order_by("-created_at")

    async def get(self, request_id: int) -> MediaRequest | None:
        return await MediaRequest.get_or_none(id=request_id)

    async def update_admin(self, req: MediaRequest, *, status, admin_note: str | None) -> MediaRequest:
        req.status = status
        req.admin_note = admin_note
        await req.save()
        return req
