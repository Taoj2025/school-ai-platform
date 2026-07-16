import time
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from ..core.logging import get_logger

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())[:8]
        start = time.time()
        logger.info(f"[{request_id}] {request.method} {request.url.path}")
        response = await call_next(request)
        duration = round((time.time() - start) * 1000, 2)
        logger.info(f"[{request_id}] {response.status_code} ({duration}ms)")
        response.headers["X-Request-ID"] = request_id
        return response


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            logger.error(f"Unhandled error: {exc}", exc_info=True)
            from .schemas import error_response
            from fastapi.responses import JSONResponse
            if isinstance(exc, HTTPException):
                return JSONResponse(status_code=exc.status_code, content=exc.detail)
            return JSONResponse(
                status_code=500,
                content=error_response("INTERNAL_ERROR", "An unexpected error occurred"),
            )


from fastapi import HTTPException
