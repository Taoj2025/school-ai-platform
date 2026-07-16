from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import User
from ...core.security import get_password_hash


async def create_user(db: AsyncSession, username: str, email: str, password: str, display_name: str | None = None) -> User:
    user = User(
        username=username,
        email=email,
        hashed_password=get_password_hash(password),
        display_name=display_name,
    )
    db.add(user)
    await db.flush()
    return user


async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()
