from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from .models import AuditLog
from .schemas import AuditLogResponse
from ...db.session import get_db
from ...common.schemas import success_response
from ...common.pagination import paginate

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/logs", response_model=dict)
async def get_audit_logs(
    module: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(AuditLog)
    count_query = select(func.count()).select_from(AuditLog)

    if module:
        query = query.where(AuditLog.module == module)
        count_query = count_query.where(AuditLog.module == module)
    if action:
        query = query.where(AuditLog.action == action)
        count_query = count_query.where(AuditLog.action == action)
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
        count_query = count_query.where(AuditLog.user_id == user_id)

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    logs = list(result.scalars().all())

    items = [AuditLogResponse.model_validate(log).model_dump() for log in logs]
    return success_response(data=paginate(items, total, page, page_size))
