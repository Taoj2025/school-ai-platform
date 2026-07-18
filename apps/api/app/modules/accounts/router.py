from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import User, UserRole, Role
from .schemas import UserCreate, UserResponse, UserLogin, TokenResponse
from .service import create_user, get_user_by_username
from ...db.session import get_db
from ...core.security import verify_password, create_access_token, decode_access_token
from ...core.role_permissions import get_role_permissions
from ...common.schemas import success_response

router = APIRouter(prefix="/auth", tags=["auth"])


async def get_user_with_roles(db: AsyncSession, user_id: str) -> tuple[User, list[str]] | None:
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        return None
    
    roles_result = await db.execute(
        select(Role.name)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id)
    )
    role_names = [r[0] for r in roles_result.all()]
    return user, role_names


@router.post("/register", response_model=dict)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_username(db, user_data.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    user = await create_user(
        db,
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
        display_name=user_data.display_name,
    )
    
    default_role_result = await db.execute(
        select(Role).where(Role.name == "leung")
    )
    default_role = default_role_result.scalar_one_or_none()
    if default_role:
        user_role = UserRole(user_id=user.id, role_id=default_role.id)
        db.add(user_role)
        await db.flush()
    
    await db.commit()
    
    return success_response(data=UserResponse.model_validate(user).model_dump())


@router.post("/login", response_model=dict)
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_username(db, login_data.username)
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    user_with_roles = await get_user_with_roles(db, user.id)
    if not user_with_roles:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User roles not found"
        )
    
    _, role_names = user_with_roles
    all_permissions = []
    for role_name in role_names:
        all_permissions.extend(get_role_permissions(role_name))
    
    token_data = {
        "sub": user.id,
        "username": user.username,
        "role": role_names[0] if role_names else "leung",
        "permissions": all_permissions,
    }
    access_token = create_access_token(token_data)
    
    return success_response(data={
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user).model_dump(),
    })


@router.get("/me", response_model=dict)
async def get_current_user(
    db: AsyncSession = Depends(get_db),
    authorization: str = Depends(lambda: None),
):
    from fastapi import Header
    async def get_current_user_from_token(
        authorization: str = Header(None),
        db: AsyncSession = Depends(get_db),
    ):
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token = authorization.replace("Bearer ", "")
        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            user_with_roles = await get_user_with_roles(db, user_id)
            if not user_with_roles:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
            
            user, role_names = user_with_roles
            return {
                "user": UserResponse.model_validate(user).model_dump(),
                "roles": role_names,
            }
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    return success_response(data=await get_current_user_from_token(
        authorization=authorization,
        db=db,
    ))
