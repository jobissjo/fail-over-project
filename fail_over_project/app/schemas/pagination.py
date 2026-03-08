from pydantic import BaseModel

from app.utils.pagination import Page, PageMeta


class PageOut(Page):
    items: list
    meta: PageMeta


class PageMetaOut(BaseModel):
    page: int
    size: int
    total: int
