from tortoise import fields
from tortoise.models import Model


class MediaType(Model):

    id = fields.IntField(pk=True)

    name = fields.CharField(max_length=100, unique=True)

    structure = fields.CharEnumField(
        enum_type=["single", "series"],
        max_length=20
    )

    def __str__(self):
        return self.name