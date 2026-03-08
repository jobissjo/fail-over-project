from pydantic import BaseModel


class UserMediaProgressOut(BaseModel):
    id: int
    user_id: int
    media_id: int
    status_id: int
    unit_id: int | None = None
    completed: bool

    class Config:
        from_attributes = True


class ProgressUpsert(BaseModel):
    media_id: int
    status_id: int
    unit_id: int | None = None
    completed: bool = False


class ProgressStatusPatch(BaseModel):
    status_id: int
