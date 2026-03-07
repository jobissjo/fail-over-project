from tortoise import fields
from tortoise.models import Model


class MediaRequest(Model):

    id = fields.IntField(pk=True)

    request_type = fields.CharEnumField(
        enum_type=["add", "update"],
        max_length=20
    )

    status = fields.CharEnumField(
        enum_type=[
            "pending",
            "accepted",
            "resolving",
            "resolved",
            "rejected"
        ],
        max_length=20,
        default="pending"
    )

    title = fields.CharField(max_length=255)

    description = fields.TextField(null=True)

    admin_note = fields.TextField(null=True)

    created_at = fields.DatetimeField(auto_now_add=True)

    resolved_at = fields.DatetimeField(null=True)

    user = fields.ForeignKeyField(
        "models.User",
        related_name="media_requests",
        on_delete=fields.CASCADE
    )

    media = fields.ForeignKeyField(
        "models.Media",
        related_name="update_requests",
        on_delete=fields.SET_NULL,
        null=True
    )

    media_type = fields.ForeignKeyField(
        "models.MediaType",
        related_name="media_requests",
        on_delete=fields.SET_NULL,
        null=True
    )

    def __str__(self):
        return f"{self.title} - {self.status}"