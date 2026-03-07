from tortoise import fields
from tortoise.models import Model


class UserMediaProgress(Model):

    id = fields.IntField(pk=True)

    completed = fields.BooleanField(default=False)

    user = fields.ForeignKeyField(
        "models.User",
        related_name="progress",
        on_delete=fields.CASCADE
    )

    media = fields.ForeignKeyField(
        "models.Media",
        related_name="user_progress",
        on_delete=fields.CASCADE
    )

    status = fields.ForeignKeyField(
        "models.Status",
        related_name="progress_entries",
        on_delete=fields.CASCADE
    )

    unit = fields.ForeignKeyField(
        "models.MediaUnit",
        related_name="unit_progress",
        on_delete=fields.CASCADE,
        null=True
    )

    class Meta:
        unique_together = ("user", "media")