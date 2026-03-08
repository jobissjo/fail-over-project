from app.models.media_unit import MediaUnit


class MediaUnitRepository:
    async def list(self, *, media_id: int | None = None) -> list[MediaUnit]:
        q = MediaUnit.all()
        if media_id is not None:
            q = q.filter(media_id=media_id)
        return await q.order_by("media_id", "number", "id")

    async def get(self, unit_id: int) -> MediaUnit | None:
        return await MediaUnit.get_or_none(id=unit_id)

    async def create(self, *, media_id: int, number: int, title: str | None) -> MediaUnit:
        return await MediaUnit.create(media_id=media_id, number=number, title=title)

    async def update(
        self,
        unit: MediaUnit,
        *,
        media_id: int | None = None,
        number: int | None = None,
        title: str | None = None,
    ) -> MediaUnit:
        if media_id is not None:
            unit.media_id = media_id
        if number is not None:
            unit.number = number
        if title is not None:
            unit.title = title
        await unit.save()
        return unit

    async def delete(self, unit: MediaUnit) -> None:
        await unit.delete()
