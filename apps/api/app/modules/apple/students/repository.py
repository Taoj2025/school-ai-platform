from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import AppleStudent, AppleAttendance, AppleCertificateRequest


async def get_student(db: AsyncSession, student_id: str) -> AppleStudent | None:
    result = await db.execute(select(AppleStudent).where(AppleStudent.id == student_id))
    return result.scalar_one_or_none()


async def get_attendance(db: AsyncSession, student_id: str) -> list[AppleAttendance]:
    result = await db.execute(select(AppleAttendance).where(AppleAttendance.student_id == student_id).order_by(AppleAttendance.date.desc()))
    return list(result.scalars().all())


async def get_certificate_requests(db: AsyncSession, student_id: str) -> list[AppleCertificateRequest]:
    result = await db.execute(select(AppleCertificateRequest).where(AppleCertificateRequest.student_id == student_id).order_by(AppleCertificateRequest.created_at.desc()))
    return list(result.scalars().all())
