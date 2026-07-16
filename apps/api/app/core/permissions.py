from functools import lru_cache
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..core.security import decode_access_token

security_scheme = HTTPBearer(auto_error=False)


class PermissionChecker:
    def __init__(self, required_permissions: list[str]):
        self.required_permissions = required_permissions

    def __call__(self, credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)):
        if not credentials:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
        try:
            payload = decode_access_token(credentials.credentials)
            user_permissions = payload.get("permissions", [])
            user_role = payload.get("role", "")
            if user_role == "admin":
                return payload
            for perm in self.required_permissions:
                if perm not in user_permissions:
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Permission denied: {perm}")
            return payload
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
