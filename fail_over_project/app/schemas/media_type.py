from pydantic import BaseModel, Field

from app.models.enums import MediaStructure


class MediaTypeOut(BaseModel):
    id: int
    name: str
    structure: MediaStructure

    class Config:
        from_attributes = True


class MediaTypeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    structure: MediaStructure


class MediaTypeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    structure: MediaStructure | None = None
