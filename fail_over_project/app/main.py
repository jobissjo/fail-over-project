
from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise

from app.core.config import settings
from app.routers import (
    auth_router,
    media_requests_router,
    media_router,
    media_types_router,
    media_units_router,
    progress_router,
    statuses_router,
)

app = FastAPI(title="Media Tracking API")

app.include_router(auth_router)
app.include_router(media_types_router)
app.include_router(statuses_router)
app.include_router(media_router)
app.include_router(media_units_router)
app.include_router(progress_router)
app.include_router(media_requests_router)

register_tortoise(
    app,
    db_url=settings.database_url,
    modules={"models": ["app.models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)


@app.get("/")
async def welcome():
    return {"message": "Welcome to Media Tracking API"}
