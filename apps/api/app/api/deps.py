from functools import lru_cache
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .security import decode_access_token
from .role_permissions import check_permission, get_role_permissions
from ..db.session import get_db
from ..modules.accounts.models import User, UserRole, Role

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user"
            )
        
        roles_result = await db.execute(
            select(Role.name)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == user_id)
        )
        role_names = [r[0] for r in roles_result.all()]
        
        all_permissions = []
        for role_name in role_names:
            all_permissions.extend(get_role_permissions(role_name))
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "roles": role_names,
            "permissions": all_permissions,
            "payload": payload,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


class PermissionChecker:
    def __init__(self, required_permissions: list[str]):
        self.required_permissions = required_permissions

    async def __call__(self, current_user: dict = Depends(get_current_user)):
        user_permissions = current_user.get("permissions", [])
        
        if "*:*:*" in user_permissions:
            return current_user
        
        for perm in self.required_permissions:
            if not check_permission(user_permissions, perm):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied: {perm}"
                )
        return current_user


def require_permissions(*permissions):
    return PermissionChecker(list(permissions))


async def require_role(db: AsyncSession, user_id: str, role_name: str) -> bool:
    result = await db.execute(
        select(Role.name)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id, Role.name == role_name)
    )
    return result.scalar_one_or_none() is not None