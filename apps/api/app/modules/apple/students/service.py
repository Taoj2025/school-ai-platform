from app.modules.apple.students.models import Attendance, CertificateRequest, Student
from app.modules.apple.students.repository import StudentRepository
from app.modules.apple.students.schemas import AttendanceCreate, CertificateRequestCreate, StudentCreate
from app.common.errors import NotFoundError


class StudentService:
    def __init__(self, repo: StudentRepository):
        self.repo = repo

    async def list_students(self) -> list[Student]:
        return await self.repo.list()

    async def get_student(self, student_id: str) -> Student:
        student = await self.repo.get_by_id(student_id)
        if not student:
            raise NotFoundError(f"Student {student_id} not found")
        return student

    async def create_student(self, data: StudentCreate, user_id: str) -> Student:
        student = Student(
            student_number=data.student_number,
            name=data.name,
            class_name=data.class_name,
            grade=data.grade,
            enrollment_date=data.enrollment_date,
            parent_contact=data.parent_contact,
            created_by=user_id,
        )
        return await self.repo.create(student)

    async def add_attendance(self, student_id: str, data: AttendanceCreate) -> Attendance:
        await self.get_student(student_id)
        record = Attendance(
            student_id=student_id,
            attendance_date=data.attendance_date,
            attendance_status=data.attendance_status,
            note=data.note,
        )
        return await self.repo.add_attendance(record)

    async def list_attendance(self, student_id: str) -> list[Attendance]:
        return await self.repo.list_attendance(student_id)

    async def add_certificate_request(self, student_id: str, data: CertificateRequestCreate, user_id: str) -> CertificateRequest:
        await self.get_student(student_id)
        req = CertificateRequest(
            student_id=student_id,
            certificate_type=data.certificate_type,
            purpose=data.purpose,
            created_by=user_id,
        )
        return await self.repo.add_certificate_request(req)

    async def list_certificate_requests(self, student_id: str) -> list[CertificateRequest]:
        return await self.repo.list_certificate_requests(student_id)
