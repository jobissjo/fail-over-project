from app.models.user import User


class UserRepository:
    async def get_by_username(self, username: str) -> User | None:
        return await User.get_or_none(username=username)

    async def get_by_email(self, email: str) -> User | None:
        return await User.get_or_none(email=email)

    async def create_user(self, username: str, email: str, hashed_password: str) -> User:
        return await User.create(username=username, email=email, password=hashed_password)
