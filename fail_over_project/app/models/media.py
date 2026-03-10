from tortoise import fields
from tortoise.models import Model


class Media(Model):

    id = fields.IntField(pk=True)

    title = fields.CharField(max_length=255)

    image = fields.CharField(max_length=255, null=True)

    total_series = fields.IntField(default=0)

    description = fields.TextField(null=True)

    media_type = fields.ForeignKeyField(
        "models.MediaType",
        related_name="media_items",
        on_delete=fields.CASCADE
    )

    @property
    def type_name(self) -> str | None:
        try:
            return self.media_type.name
        except AttributeError:
            return None

    @property
    def type_structure(self) -> str | None:
        try:
            return self.media_type.structure
        except AttributeError:
            return None

    def __str__(self):
        return self.title