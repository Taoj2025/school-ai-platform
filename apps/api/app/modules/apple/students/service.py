import uuid
from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from .models import AppleStudent, AppleAttendance, AppleCertificateRequest
from .schemas import (
    StudentCreate, StudentUpdate, StudentResponse,
    AttendanceCreate, AttendanceUpdate, AttendanceResponse,
    AttendanceImportRequest,
    CertificateRequestCreate, CertificateRequestUpdate, CertificateRequestResponse,
    StudentImportRequest,
)


class StudentService:
    """Service for managing students, attendance, and certificates."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def list_students(
        self,
        class_name: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ):
        """List students with filtering and pagination."""
        query = select(AppleStudent)
        count_query = select(func.count()).select_from(AppleStudent)
        
        if class_name:
            query = query.where(AppleStudent.class_name == class_name)
            count_query = count_query.where(AppleStudent.class_name == class_name)
        if status:
            query = query.where(AppleStudent.status == status)
            count_query = count_query.where(AppleStudent.status == status)
        
        total = (await self.db.execute(count_query)).scalar() or 0
        query = query.order_by(AppleStudent.class_name, AppleStudent.name_en).offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        students = result.scalars().all()
        
        items = [{
            "id": s.id,
            "student_no": s.student_no,
            "name_en": s.name_en,
            "name_zh": s.name_zh,
            "gender": s.gender,
            "date_of_birth": s.date_of_birth.isoformat() if s.date_of_birth else None,
            "class_name": s.class_name,
            "class_no": s.class_no,
            "admission_date": s.admission_date.isoformat() if s.admission_date else None,
            "status": s.status,
            "parent_name": s.parent_name,
            "parent_phone": s.parent_phone,
            "parent_email": s.parent_email,
            "address": s.address,
            "notes": s.notes,
            "created_at": s.created_at,
            "updated_at": s.updated_at,
        } for s in students]
        
        return items, total
    
    async def get_student(self, student_id: str) -> Optional[AppleStudent]:
        """Get a student by ID."""
        result = await self.db.execute(
            select(AppleStudent).where(AppleStudent.id == student_id)
        )
        return result.scalar_one_or_none()
    
    async def create_student(self, student_data: StudentCreate) -> AppleStudent:
        """Create a new student."""
        data = student_data.model_dump()
        db_student = AppleStudent(
            id=str(uuid.uuid4()),
            student_no=data["student_no"],
            name_en=data["name_en"],
            name_zh=data.get("name_zh"),
            gender=data.get("gender"),
            date_of_birth=data.get("date_of_birth"),
            class_name=data["class_name"],
            class_no=data.get("class_no"),
            admission_date=data.get("admission_date"),
            status="active",
            parent_name=data.get("parent_name"),
            parent_phone=data.get("parent_phone"),
            parent_email=data.get("parent_email"),
            address=data.get("address"),
            notes=data.get("notes"),
        )
        self.db.add(db_student)
        await self.db.flush()
        return db_student
    
    async def update_student(self, student_id: str, update_data: StudentUpdate) -> Optional[AppleStudent]:
        """Update a student."""
        student = await self.get_student(student_id)
        if not student:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if hasattr(student, key):
                setattr(student, key, value)
        
        student.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return student
    
    async def delete_student(self, student_id: str) -> bool:
        """Delete a student."""
        student = await self.get_student(student_id)
        if not student:
            return False
        
        await self.db.delete(student)
        await self.db.flush()
        return True
    
    async def import_students(self, request: StudentImportRequest) -> dict:
        """Import multiple students at once."""
        imported = 0
        failed = 0
        errors = []
        
        for i, student_data in enumerate(request.students):
            try:
                await self.create_student(student_data)
                imported += 1
            except Exception as e:
                failed += 1
                errors.append(f"Row {i+1}: {str(e)}")
        
        await self.db.commit()
        
        return {
            "imported": imported,
            "failed": failed,
            "errors": errors,
        }
    
    async def get_stats(self) -> dict:
        """Get student statistics."""
        # Total count
        total = await self.db.execute(select(func.count()).select_from(AppleStudent))
        total = total.scalar() or 0
        
        # By status
        active = await self.db.execute(
            select(func.count()).select_from(AppleStudent)
            .where(AppleStudent.status == "active")
        )
        active = active.scalar() or 0
        
        graduated = await self.db.execute(
            select(func.count()).select_from(AppleStudent)
            .where(AppleStudent.status == "graduated")
        )
        graduated = graduated.scalar() or 0
        
        transferred = await self.db.execute(
            select(func.count()).select_from(AppleStudent)
            .where(AppleStudent.status == "transferred")
        )
        transferred = transferred.scalar() or 0
        
        suspended = await self.db.execute(
            select(func.count()).select_from(AppleStudent)
            .where(AppleStudent.status == "suspended")
        )
        suspended = suspended.scalar() or 0
        
        # Classes
        classes_result = await self.db.execute(
            select(AppleStudent.class_name, func.count(AppleStudent.id))
            .group_by(AppleStudent.class_name)
        )
        classes = {row[0]: row[1] for row in classes_result.all()}
        
        return {
            "total_students": total,
            "active": active,
            "graduated": graduated,
            "transferred": transferred,
            "suspended": suspended,
            "classes": classes,
        }
    
    async def list_attendance(
        self,
        student_id: str,
        page: int = 1,
        page_size: int = 20,
    ):
        """List attendance records for a student."""
        query = select(AppleAttendance)
        count_query = select(func.count()).select_from(AppleAttendance)
        
        query = query.where(AppleAttendance.student_id == student_id)
        count_query = count_query.where(AppleAttendance.student_id == student_id)
        
        total = (await self.db.execute(count_query)).scalar() or 0
        query = query.order_by(AppleAttendance.date.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        records = result.scalars().all()
        
        items = [{
            "id": r.id,
            "student_id": r.student_id,
            "date": r.date.isoformat() if r.date else None,
            "status": r.status,
            "period": r.period,
            "remark": r.remark,
            "recorded_by": r.recorded_by,
            "created_at": r.created_at,
        } for r in records]
        
        return items, total
    
    async def add_attendance(self, student_id: str, record_data: AttendanceCreate) -> AppleAttendance:
        """Add an attendance record."""
        data = record_data.model_dump()
        db_record = AppleAttendance(
            id=str(uuid.uuid4()),
            student_id=student_id,
            date=data["date"],
            status=data["status"],
            period=data.get("period"),
            remark=data.get("remark"),
            recorded_by=data.get("recorded_by"),
        )
        self.db.add(db_record)
        await self.db.flush()
        return db_record
    
    async def import_attendance(self, student_id: str, request: AttendanceImportRequest) -> dict:
        """Import multiple attendance records at once."""
        imported = 0
        for record in request.records:
            try:
                await self.add_attendance(student_id, record)
                imported += 1
            except Exception:
                pass
        
        await self.db.commit()
        
        return {
            "imported": imported,
            "failed": len(request.records) - imported,
        }
    
    async def get_attendance_stats(self, student_id: Optional[str] = None) -> dict:
        """Get attendance statistics."""
        query = select(AppleAttendance)
        if student_id:
            query = query.where(AppleAttendance.student_id == student_id)
        
        result = await self.db.execute(query)
        records = result.scalars().all()
        
        total = len(records)
        present = sum(1 for r in records if r.status == "present")
        late = sum(1 for r in records if r.status == "late")
        absent = sum(1 for r in records if r.status == "absent")
        sick_leave = sum(1 for r in records if r.status == "sick_leave")
        leave = sum(1 for r in records if r.status == "leave")
        
        attendance_rate = (present + late) / total if total > 0 else 0
        
        return {
            "total_records": total,
            "present": present,
            "late": late,
            "absent": absent,
            "sick_leave": sick_leave,
            "leave": leave,
            "attendance_rate": round(attendance_rate * 100, 2),
        }
    
    async def list_certificates(
        self,
        student_id: str,
        page: int = 1,
        page_size: int = 20,
    ):
        """List certificate requests for a student."""
        query = select(AppleCertificateRequest)
        count_query = select(func.count()).select_from(AppleCertificateRequest)
        
        query = query.where(AppleCertificateRequest.student_id == student_id)
        count_query = count_query.where(AppleCertificateRequest.student_id == student_id)
        
        total = (await self.db.execute(count_query)).scalar() or 0
        query = query.order_by(AppleCertificateRequest.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        certs = result.scalars().all()
        
        items = [CertificateRequestResponse.model_validate(c).model_dump() for c in certs]
        return items, total
    
    async def list_all_certificates(
        self,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ):
        """List all certificate requests."""
        query = select(AppleCertificateRequest)
        count_query = select(func.count()).select_from(AppleCertificateRequest)
        
        if status:
            query = query.where(AppleCertificateRequest.status == status)
            count_query = count_query.where(AppleCertificateRequest.status == status)
        
        total = (await self.db.execute(count_query)).scalar() or 0
        query = query.order_by(AppleCertificateRequest.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        certs = result.scalars().all()
        
        items = [CertificateRequestResponse.model_validate(c).model_dump() for c in certs]
        return items, total
    
    async def create_certificate_request(
        self,
        student_id: str,
        request_data: CertificateRequestCreate,
    ) -> AppleCertificateRequest:
        """Create a certificate request."""
        data = request_data.model_dump()
        db_request = AppleCertificateRequest(
            id=str(uuid.uuid4()),
            student_id=student_id,
            certificate_type=data["certificate_type"],
            purpose=data.get("purpose"),
            quantity=data.get("quantity", 1),
            notes=data.get("notes"),
            status="pending",
        )
        self.db.add(db_request)
        await self.db.flush()
        return db_request
    
    async def update_certificate(self, cert_id: str, update_data: CertificateRequestUpdate) -> Optional[AppleCertificateRequest]:
        """Update a certificate request."""
        result = await self.db.execute(
            select(AppleCertificateRequest).where(AppleCertificateRequest.id == cert_id)
        )
        cert = result.scalar_one_or_none()
        if not cert:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if hasattr(cert, key):
                setattr(cert, key, value)
        
        cert.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return cert
    
    async def generate_certificate_pdf(self, student_id: str, cert_id: str) -> dict:
        """
        Generate certificate PDF.
        
        In production, this would use docxtpl to generate actual PDF files.
        """
        student = await self.get_student(student_id)
        if not student:
            raise ValueError("Student not found")
        
        result = await self.db.execute(
            select(AppleCertificateRequest).where(AppleCertificateRequest.id == cert_id)
        )
        cert = result.scalar_one_or_none()
        if not cert:
            raise ValueError("Certificate not found")
        
        # Update status
        cert.status = "issued"
        cert.issued_date = date.today()
        cert.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        
        return {
            "certificate_id": cert_id,
            "student_id": student_id,
            "student_name": student.name_en,
            "student_name_zh": student.name_zh,
            "class_name": student.class_name,
            "certificate_type": cert.certificate_type,
            "issued_date": date.today().isoformat(),
            "download_url": f"/api/v1/apple/students/{student_id}/certificates/{cert_id}/download",
        }
