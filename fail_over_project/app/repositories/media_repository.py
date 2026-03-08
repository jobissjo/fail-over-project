from app.models.media import Media


class MediaRepository:
    async def list(self, *, offset: int = 0, limit: int = 20) -> tuple[list[Media], int]:
        total = await Media.all().count()
        items = await Media.all().order_by("id").offset(offset).limit(limit)
        return items, total

    async def get(self, media_id: int) -> Media | None:
        return await Media.get_or_none(id=media_id)

    async def create(
        self,
        *,
        title: str,
        image: str | None,
        media_type_id: int,
        total_series: int,
        description: str | None,
    ) -> Media:
        return await Media.create(
            title=title,
            image=image,
            media_type_id=media_type_id,
            total_series=total_series,
            description=description,
        )

    async def update(
        self,
        media_obj: Media,
        *,
        title: str | None = None,
        image: str | None = None,
        media_type_id: int | None = None,
        total_series: int | None = None,
        description: str | None = None,
    ) -> Media:
        if title is not None:
            media_obj.title = title
        if image is not None:
            media_obj.image = image
        if media_type_id is not None:
            media_obj.media_type_id = media_type_id
        if total_series is not None:
            media_obj.total_series = total_series
        if description is not None:
            media_obj.description = description
        await media_obj.save()
        return media_obj

    async def delete(self, media_obj: Media) -> None:
        await media_obj.delete()
