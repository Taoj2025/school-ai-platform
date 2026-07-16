from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import AppleStudent


async def list_students(db: AsyncSession, class_name: str | None = None, status: str | None = None, skip: int = 0, limit: int = 20):
    query = select(AppleStudent)
    if class_name:
        query = query.where(AppleStudent.class_name == class_name)
    if status:
        query = query.where(AppleStudent.status == status)
    result = await db.execute(query.order_by(AppleStudent.class_name, AppleStudent.name_en).offset(skip).limit(limit))
    return list(result.scalars().all())


async def count_students(db: AsyncSession, class_name: str | None = None, status: str | None = None) -> int:
    query = select(func.count()).select_from(AppleStudent)
    if class_name:
        query = query.where(AppleStudent.class_name == class_name)
    if status:
        query = query.where(AppleStudent.status == status)
    return (await db.execute(query)).scalar() or 0
