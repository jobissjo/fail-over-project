from tortoise import fields
from tortoise.models import Model
from enum import Enum

class UserRole(str, Enum):
    ADMIN = 'admin'
    USER = 'user'


class User(Model):

    id = fields.IntField(pk=True)

    username = fields.CharField(max_length=50, unique=True)

    email = fields.CharField(max_length=255, unique=True)

    role = fields.CharEnumField(UserRole, default=UserRole.USER)

    password = fields.CharField(max_length=255)

    is_active = fields.BooleanField(default=True)

    created_at = fields.DatetimeField(auto_now_add=True)


class Profile(Model):

    id = fields.IntField(pk=True)

    user = fields.OneToOneField(
        "models.User",
        related_name="profile",
        on_delete=fields.CASCADE
    )

    avatar = fields.CharField(max_length=255, null=True)

    bio = fields.TextField(null=True)