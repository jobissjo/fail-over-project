from fastapi import APIRouter, status

from app.schemas.auth import LoginIn, RegisterIn, TokenOut, UserOut
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterIn):
    service = AuthService()
    user = await service.register(payload)
    return user


@router.post("/login", response_model=TokenOut)
async def login(payload: LoginIn):
    service = AuthService()
    token = await service.login(payload)
    return TokenOut(access_token=token)
