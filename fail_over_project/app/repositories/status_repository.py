from app.models.status import Status


class StatusRepository:
    async def list(self) -> list[Status]:
        return await Status.all().order_by("media_type_id", "order", "id")

    async def get(self, status_id: int) -> Status | None:
        return await Status.get_or_none(id=status_id)

    async def create(self, *, name: str, category, order: int, media_type_id: int) -> Status:
        return await Status.create(name=name, category=category, order=order, media_type_id=media_type_id)

    async def update(
        self,
        status_obj: Status,
        *,
        name: str | None = None,
        category=None,
        order: int | None = None,
        media_type_id: int | None = None,
    ) -> Status:
        if name is not None:
            status_obj.name = name
        if category is not None:
            status_obj.category = category
        if order is not None:
            status_obj.order = order
        if media_type_id is not None:
            status_obj.media_type_id = media_type_id
        await status_obj.save()
        return status_obj

    async def delete(self, status_obj: Status) -> None:
        await status_obj.delete()
