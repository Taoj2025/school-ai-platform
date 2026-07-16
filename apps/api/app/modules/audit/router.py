from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import PaginationParams
from app.common.schemas import PaginatedResponse, PaginationMeta
from app.core.permissions import get_current_user
from app.db.session import get_db
from app.modules.audit.models import AuditLog
from app.modules.audit.schemas import AuditLogResponse

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("/logs", response_model=PaginatedResponse[AuditLogResponse])
async def get_audit_logs(
    module: str | None = Query(None),
    action: str | None = Query(None),
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = select(AuditLog)
    count_query = select(func.count()).select_from(AuditLog)

    if module:
        query = query.where(AuditLog.module == module)
        count_query = count_query.where(AuditLog.module == module)
    if action:
        query = query.where(AuditLog.action == action)
        count_query = count_query.where(AuditLog.action == action)

    query = query.order_by(AuditLog.created_at.desc()).offset(pagination.offset).limit(pagination.limit)

    result = await db.execute(query)
    logs = result.scalars().all()
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    return PaginatedResponse(
        data=[AuditLogResponse.model_validate(log) for log in logs],
        pagination=PaginationMeta(page=pagination.page, page_size=pagination.page_size, total=total),
    )
