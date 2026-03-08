from tortoise import fields
from tortoise.models import Model

from app.models.enums import MediaStructure

class MediaType(Model):

    id = fields.IntField(pk=True)

    name = fields.CharField(max_length=100, unique=True)

    structure = fields.CharEnumField(
        enum_type=MediaStructure,
        max_length=20
    )

    def __str__(self):
        return self.name