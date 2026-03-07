from tortoise import fields
from tortoise.models import Model


class Status(Model):

    id = fields.IntField(pk=True)

    name = fields.CharField(max_length=100)

    category = fields.CharEnumField(
        enum_type=["todo", "active", "done"],
        max_length=20
    )

    order = fields.IntField(default=0)

    media_type = fields.ForeignKeyField(
        "models.MediaType",
        related_name="statuses",
        on_delete=fields.CASCADE
    )

    def __str__(self):
        return f"{self.name} ({self.category})"