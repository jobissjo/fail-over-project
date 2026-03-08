from .auth import router as auth_router
from .media import router as media_router
from .media_requests import router as media_requests_router
from .media_types import router as media_types_router
from .media_units import router as media_units_router
from .progress import router as progress_router
from .statuses import router as statuses_router

__all__ = [
    "auth_router",
    "media_router",
    "media_requests_router",
    "media_types_router",
    "media_units_router",
    "progress_router",
    "statuses_router",
]
