from app.models.user_media_progress import UserMediaProgress


class ProgressRepository:
    async def list_for_user(self, user_id: int) -> list[UserMediaProgress]:
        return await UserMediaProgress.filter(user_id=user_id).order_by("id")

    async def get(self, progress_id: int) -> UserMediaProgress | None:
        return await UserMediaProgress.get_or_none(id=progress_id)

    async def get_for_user_and_media(self, *, user_id: int, media_id: int) -> UserMediaProgress | None:
        return await UserMediaProgress.get_or_none(user_id=user_id, media_id=media_id)

    async def create(
        self,
        *,
        user_id: int,
        media_id: int,
        status_id: int,
        unit_id: int | None,
        completed: bool,
    ) -> UserMediaProgress:
        return await UserMediaProgress.create(
            user_id=user_id,
            media_id=media_id,
            status_id=status_id,
            unit_id=unit_id,
            completed=completed,
        )

    async def update(
        self,
        progress: UserMediaProgress,
        *,
        status_id: int | None = None,
        unit_id: int | None = None,
        completed: bool | None = None,
    ) -> UserMediaProgress:
        if status_id is not None:
            progress.status_id = status_id
        if unit_id is not None or unit_id is None:
            progress.unit_id = unit_id
        if completed is not None:
            progress.completed = completed
        await progress.save()
        return progress

    async def delete(self, progress: UserMediaProgress) -> None:
        await progress.delete()
