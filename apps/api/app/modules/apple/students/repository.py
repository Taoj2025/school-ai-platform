from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import AppleStudent, AppleAttendance, AppleCertificateRequest


class StudentRepository:
    """Repository for student data access."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, student_id: str) -> Optional[AppleStudent]:
        """Get student by ID."""
        result = await self.db.execute(
            select(AppleStudent).where(AppleStudent.id == student_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_student_no(self, student_no: str) -> Optional[AppleStudent]:
        """Get student by student number."""
        result = await self.db.execute(
            select(AppleStudent).where(AppleStudent.student_no == student_no)
        )
        return result.scalar_one_or_none()
    
    async def get_attendance_by_id(self, attendance_id: str) -> Optional[AppleAttendance]:
        """Get attendance record by ID."""
        result = await self.db.execute(
            select(AppleAttendance).where(AppleAttendance.id == attendance_id)
        )
        return result.scalar_one_or_none()
    
    async def get_certificate_by_id(self, cert_id: str) -> Optional[AppleCertificateRequest]:
        """Get certificate request by ID."""
        result = await self.db.execute(
            select(AppleCertificateRequest).where(AppleCertificateRequest.id == cert_id)
        )
        return result.scalar_one_or_none()
    
    async def list_by_class(self, class_name: str) -> List[AppleStudent]:
        """Get all students in a class."""
        result = await self.db.execute(
            select(AppleStudent)
            .where(AppleStudent.class_name == class_name)
            .order_by(AppleStudent.class_no, AppleStudent.name_en)
        )
        return list(result.scalars().all())
    
    async def count_by_status(self, status: str) -> int:
        """Count students by status."""
        result = await self.db.execute(
            select(func.count()).select_from(AppleStudent)
            .where(AppleStudent.status == status)
        )
        return result.scalar() or 0
    
    async def get_attendance_by_date(
        self,
        student_id: str,
        date_str: str,
    ) -> Optional[AppleAttendance]:
        """Get attendance for a specific date."""
        result = await self.db.execute(
            select(AppleAttendance)
            .where(AppleAttendance.student_id == student_id)
            .where(AppleAttendance.date == date_str)
        )
        return result.scalar_one_or_none()
    
    async def get_all_classes(self) -> List[str]:
        """Get all unique class names."""
        result = await self.db.execute(
            select(AppleStudent.class_name)
            .distinct()
            .order_by(AppleStudent.class_name)
        )
        return [row[0] for row in result.all()]
