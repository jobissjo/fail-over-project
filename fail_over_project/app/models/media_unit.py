from tortoise import fields
from tortoise.models import Model


class MediaUnit(Model):

    id = fields.IntField(pk=True)

    number = fields.IntField()

    title = fields.CharField(max_length=255, null=True)

    media = fields.ForeignKeyField(
        "models.Media",
        related_name="units",
        on_delete=fields.CASCADE
    )

    class Meta:
        ordering = ["number"]

        unique_together = ("media", "number")