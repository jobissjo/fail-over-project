from pydantic import BaseModel, Field

from app.models.enums import StatusCategory


class StatusOut(BaseModel):
    id: int
    name: str
    category: StatusCategory
    order: int
    media_type_id: int

    class Config:
        from_attributes = True


class StatusCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category: StatusCategory
    order: int = 0
    media_type_id: int


class StatusUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    category: StatusCategory | None = None
    order: int | None = None
    media_type_id: int | None = None
