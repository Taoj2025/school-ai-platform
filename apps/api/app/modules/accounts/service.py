from app.modules.accounts.models import User
from app.modules.accounts.repository import UserRepository
from app.modules.accounts.schemas import UserCreate
from app.core.security import hash_password, verify_password, create_access_token
from app.common.errors import ValidationError, UnauthorizedError


class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def create_user(self, data: UserCreate) -> User:
        existing = await self.repo.get_by_username(data.username)
        if existing:
            raise ValidationError("Username already exists")
        user = User(
            username=data.username,
            hashed_password=hash_password(data.password),
            display_name=data.display_name,
            email=data.email,
        )
        return await self.repo.create(user)

    async def authenticate(self, username: str, password: str) -> str:
        user = await self.repo.get_by_username(username)
        if not user or not verify_password(password, user.hashed_password):
            raise UnauthorizedError("Invalid credentials")
        if not user.is_active:
            raise UnauthorizedError("Account is disabled")
        return create_access_token({"sub": user.id, "username": user.username})
