from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.schemas import ResponseSchema
from app.core.permissions import get_current_user
from app.db.session import get_db
from app.modules.apple.students.repository import StudentRepository
from app.modules.apple.students.schemas import (
    AttendanceCreate,
    AttendanceRead,
    CertificateRequestCreate,
    CertificateRequestRead,
    StudentCreate,
    StudentRead,
)
from app.modules.apple.students.service import StudentService

router = APIRouter(prefix="/apple/students", tags=["Apple - Students"])


@router.get("", response_model=ResponseSchema[list[StudentRead]])
async def list_students(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = StudentService(StudentRepository(db))
    students = await service.list_students()
    return ResponseSchema(data=[StudentRead.model_validate(s) for s in students], meta={})


@router.post("", response_model=ResponseSchema[StudentRead])
async def create_student(
    data: StudentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = StudentService(StudentRepository(db))
    student = await service.create_student(data, current_user["user_id"])
    return ResponseSchema(data=StudentRead.model_validate(student), meta={})


@router.get("/{student_id}", response_model=ResponseSchema[StudentRead])
async def get_student(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = StudentService(StudentRepository(db))
    student = await service.get_student(student_id)
    return ResponseSchema(data=StudentRead.model_validate(student), meta={})


@router.post("/{student_id}/attendance", response_model=ResponseSchema[AttendanceRead])
async def add_attendance(
    student_id: str,
    data: AttendanceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = StudentService(StudentRepository(db))
    record = await service.add_attendance(student_id, data)
    return ResponseSchema(data=AttendanceRead.model_validate(record), meta={})


@router.get("/{student_id}/attendance", response_model=ResponseSchema[list[AttendanceRead]])
async def list_attendance(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = StudentService(StudentRepository(db))
    records = await service.list_attendance(student_id)
    return ResponseSchema(data=[AttendanceRead.model_validate(r) for r in records], meta={})


@router.post("/{student_id}/certificates", response_model=ResponseSchema[CertificateRequestRead])
async def create_certificate_request(
    student_id: str,
    data: CertificateRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = StudentService(StudentRepository(db))
    req = await service.add_certificate_request(student_id, data, current_user["user_id"])
    return ResponseSchema(data=CertificateRequestRead.model_validate(req), meta={})


@router.get("/{student_id}/certificates", response_model=ResponseSchema[list[CertificateRequestRead]])
async def list_certificate_requests(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = StudentService(StudentRepository(db))
    requests = await service.list_certificate_requests(student_id)
    return ResponseSchema(data=[CertificateRequestRead.model_validate(r) for r in requests], meta={})
