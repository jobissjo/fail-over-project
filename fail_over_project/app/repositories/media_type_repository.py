from app.models.media_type import MediaType


class MediaTypeRepository:
    async def list(self) -> list[MediaType]:
        return await MediaType.all().order_by("id")

    async def get(self, media_type_id: int) -> MediaType | None:
        return await MediaType.get_or_none(id=media_type_id)

    async def create(self, name: str, structure) -> MediaType:
        return await MediaType.create(name=name, structure=structure)

    async def update(self, media_type: MediaType, *, name: str | None = None, structure=None) -> MediaType:
        if name is not None:
            media_type.name = name
        if structure is not None:
            media_type.structure = structure
        await media_type.save()
        return media_type

    async def delete(self, media_type: MediaType) -> None:
        await media_type.delete()
