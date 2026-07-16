from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.schemas import ResponseSchema
from app.db.session import get_db
from app.modules.accounts.repository import UserRepository
from app.modules.accounts.schemas import LoginRequest, TokenResponse, UserCreate, UserRead
from app.modules.accounts.service import UserService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=ResponseSchema[UserRead])
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    service = UserService(UserRepository(db))
    user = await service.create_user(data)
    return ResponseSchema(data=UserRead.model_validate(user), meta={})


@router.post("/login", response_model=ResponseSchema[TokenResponse])
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = UserService(UserRepository(db))
    token = await service.authenticate(data.username, data.password)
    return ResponseSchema(data=TokenResponse(access_token=token), meta={})
