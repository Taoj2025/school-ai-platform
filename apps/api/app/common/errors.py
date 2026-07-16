from fastapi import HTTPException


class AppError(HTTPException):
    def __init__(self, status_code: int, error: str, detail: str | None = None):
        super().__init__(status_code=status_code, detail={"error": error, "detail": detail})


class NotFoundError(AppError):
    def __init__(self, resource: str = "Resource", id: str | int | None = None):
        msg = f"{resource} not found"
        if id is not None:
            msg = f"{resource} with id {id} not found"
        super().__init__(status_code=404, error="NOT_FOUND", detail=msg)


class ValidationError(AppError):
    def __init__(self, detail: str):
        super().__init__(status_code=422, error="VALIDATION_ERROR", detail=detail)


class PermissionDeniedError(AppError):
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(status_code=403, error="PERMISSION_DENIED", detail=detail)


class ConflictError(AppError):
    def __init__(self, detail: str):
        super().__init__(status_code=409, error="CONFLICT", detail=detail)
