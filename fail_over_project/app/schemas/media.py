from pydantic import BaseModel, Field


class MediaOut(BaseModel):
    id: int
    title: str
    image: str | None = None
    media_type_id: int
    total_series: int
    description: str | None = None

    class Config:
        from_attributes = True


class MediaCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    image: str | None = Field(default=None, max_length=255)
    media_type_id: int
    total_series: int = 0
    description: str | None = None


class MediaUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    image: str | None = Field(default=None, max_length=255)
    media_type_id: int | None = None
    total_series: int | None = None
    description: str | None = None
