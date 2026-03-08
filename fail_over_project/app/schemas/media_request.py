from pydantic import BaseModel, Field

from app.models.enums import MediaRequestStatus, MediaRequestType


class MediaRequestOut(BaseModel):
    id: int
    user_id: int
    request_type: MediaRequestType
    media_id: int | None = None
    title: str
    description: str | None = None
    media_type_id: int | None = None
    status: MediaRequestStatus
    admin_note: str | None = None

    class Config:
        from_attributes = True


class MediaRequestCreate(BaseModel):
    request_type: MediaRequestType
    media_id: int | None = None
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    media_type_id: int | None = None


class MediaRequestAdminPatch(BaseModel):
    status: MediaRequestStatus
    admin_note: str | None = None
