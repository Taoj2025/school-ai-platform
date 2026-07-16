from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.apple.students.models import Attendance, CertificateRequest, Student


class StudentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(self, offset: int = 0, limit: int = 20) -> list[Student]:
        result = await self.db.execute(
            select(Student).offset(offset).limit(limit).order_by(Student.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, student_id: str) -> Student | None:
        result = await self.db.execute(
            select(Student)
            .options(selectinload(Student.attendance_records), selectinload(Student.certificate_requests))
            .where(Student.id == student_id)
        )
        return result.scalar_one_or_none()

    async def create(self, student: Student) -> Student:
        self.db.add(student)
        await self.db.flush()
        return student

    async def delete(self, student: Student) -> None:
        await self.db.delete(student)

    async def add_attendance(self, record: Attendance) -> Attendance:
        self.db.add(record)
        await self.db.flush()
        return record

    async def list_attendance(self, student_id: str) -> list[Attendance]:
        result = await self.db.execute(
            select(Attendance).where(Attendance.student_id == student_id).order_by(Attendance.attendance_date.desc())
        )
        return list(result.scalars().all())

    async def add_certificate_request(self, req: CertificateRequest) -> CertificateRequest:
        self.db.add(req)
        await self.db.flush()
        return req

    async def list_certificate_requests(self, student_id: str) -> list[CertificateRequest]:
        result = await self.db.execute(
            select(CertificateRequest)
            .where(CertificateRequest.student_id == student_id)
            .order_by(CertificateRequest.created_at.desc())
        )
        return list(result.scalars().all())
