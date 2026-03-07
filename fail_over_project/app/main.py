
from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise

app = FastAPI()

register_tortoise(
    app,
    db_url="postgres://postgres:postgres@localhost:6432/testdb",
    modules={"models": ["app.models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)