from functools import wraps
from typing import Any

from fastapi import Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.errors import ForbiddenError, UnauthorizedError
from app.core.security import decode_access_token
from app.db.session import get_db


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise UnauthorizedError("Missing or invalid authorization header")

    token = auth_header.split(" ", 1)[1]
    payload = decode_access_token(token)
    if payload is None:
        raise UnauthorizedError("Invalid or expired token")

    from app.modules.accounts.models import User

    result = await db.execute(select(User).where(User.id == payload.get("sub")))
    user = result.scalar_one_or_none()
    if user is None:
        raise UnauthorizedError("User not found")

    return {"user": user, "user_id": user.id}


def require_permission(permission: str):
    async def _check_permission(
        current_user: dict = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> dict:
        user = current_user["user"]

        from app.modules.accounts.models import Role, RolePermission

        result = await db.execute(
            select(Role)
            .join(Role.users)
            .join(RolePermission, RolePermission.role_id == Role.id)
            .where(
                Role.users.any(id=user.id),
                RolePermission.permission == permission,
            )
        )
        has_perm = result.scalar_one_or_none() is not None

        if not has_perm:
            is_admin_result = await db.execute(
                select(Role).join(Role.users).where(Role.users.any(id=user.id), Role.name == "admin")
            )
            if is_admin_result.scalar_one_or_none() is None:
                raise ForbiddenError(f"Permission denied: {permission}")

        return current_user

    return _check_permission
