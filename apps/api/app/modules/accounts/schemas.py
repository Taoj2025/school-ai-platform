from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    password: str
    display_name: str | None = None
    email: str | None = None


class UserRead(BaseModel):
    id: str
    username: str
    display_name: str | None = None
    email: str | None = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
