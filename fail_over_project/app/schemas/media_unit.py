from pydantic import BaseModel, Field


class MediaUnitOut(BaseModel):
    id: int
    media_id: int
    number: int
    title: str | None = None

    class Config:
        from_attributes = True


class MediaUnitCreate(BaseModel):
    media_id: int
    number: int = Field(ge=1)
    title: str | None = Field(default=None, max_length=255)


class MediaUnitUpdate(BaseModel):
    media_id: int | None = None
    number: int | None = Field(default=None, ge=1)
    title: str | None = Field(default=None, max_length=255)
