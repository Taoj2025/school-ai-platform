from typing import Any, Optional
from pydantic import BaseModel


class MetaInfo(BaseModel):
    page: Optional[int] = None
    page_size: Optional[int] = None
    total: Optional[int] = None
    total_pages: Optional[int] = None


class SuccessResponse(BaseModel):
    data: Any = None
    meta: Optional[MetaInfo] = None


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[Any] = None
    meta: Optional[MetaInfo] = None


def success_response(data: Any = None, meta: Optional[dict] = None) -> dict:
    resp = {"data": data}
    if meta:
        resp["meta"] = MetaInfo(**meta).model_dump()
    else:
        resp["meta"] = MetaInfo().model_dump()
    return resp


def error_response(error: str, detail: Any = None) -> dict:
    return {"error": error, "detail": detail, "meta": MetaInfo().model_dump()}
