from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from .models import AppleStudent, AppleAttendance, AppleCertificateRequest
from .schemas import (
    StudentCreate, StudentUpdate, StudentResponse,
    AttendanceCreate, AttendanceUpdate, AttendanceResponse,
    AttendanceImportRequest, AttendanceStatsResponse,
    CertificateRequestCreate, CertificateRequestUpdate, CertificateRequestResponse,
    StudentImportRequest, StudentImportResponse,
    StudentStatsResponse,
)
from .service import StudentService
from ....db.session import get_db
from ....common.schemas import success_response
from ....common.pagination import paginate

router = APIRouter(prefix="/apple/students", tags=["apple-students"])


@router.get("", response_model=dict)
async def list_students(
    class_name: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    items, total = await service.list_students(
        class_name=class_name,
        status=status,
        page=page,
        page_size=page_size,
    )
    return success_response(data=paginate(items, total, page, page_size))


@router.get("/stats", response_model=dict)
async def get_student_stats(db: AsyncSession = Depends(get_db)):
    service = StudentService(db)
    stats = await service.get_stats()
    return success_response(data=stats)


@router.post("", response_model=dict)
async def create_student(student: StudentCreate, db: AsyncSession = Depends(get_db)):
    service = StudentService(db)
    db_student = await service.create_student(student)
    return success_response(data=StudentResponse.model_validate(db_student).model_dump())


@router.post("/import", response_model=dict)
async def import_students(
    request: StudentImportRequest,
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    result = await service.import_students(request)
    return success_response(data=result)


@router.get("/{student_id}", response_model=dict)
async def get_student(student_id: str, db: AsyncSession = Depends(get_db)):
    service = StudentService(db)
    student = await service.get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return success_response(data=StudentResponse.model_validate(student).model_dump())


@router.patch("/{student_id}", response_model=dict)
async def update_student(
    student_id: str,
    update_data: StudentUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    student = await service.update_student(student_id, update_data)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return success_response(data=StudentResponse.model_validate(student).model_dump())


@router.delete("/{student_id}", response_model=dict)
async def delete_student(student_id: str, db: AsyncSession = Depends(get_db)):
    service = StudentService(db)
    deleted = await service.delete_student(student_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Student not found")
    return success_response(data={"deleted": True, "id": student_id})


@router.get("/{student_id}/attendance", response_model=dict)
async def list_attendance(
    student_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    items, total = await service.list_attendance(
        student_id=student_id,
        page=page,
        page_size=page_size,
    )
    return success_response(data=paginate(items, total, page, page_size))


@router.post("/{student_id}/attendance", response_model=dict)
async def record_attendance(
    student_id: str,
    record: AttendanceCreate,
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    db_record = await service.add_attendance(student_id, record)
    return success_response(data=AttendanceResponse.model_validate(db_record).model_dump())


@router.post("/{student_id}/attendance/import", response_model=dict)
async def import_attendance(
    student_id: str,
    request: AttendanceImportRequest,
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    result = await service.import_attendance(student_id, request)
    return success_response(data=result)


@router.get("/attendance/stats", response_model=dict)
async def get_attendance_stats(
    student_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    stats = await service.get_attendance_stats(student_id)
    return success_response(data=stats)


@router.get("/{student_id}/certificates", response_model=dict)
async def list_certificates(
    student_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    items, total = await service.list_certificates(
        student_id=student_id,
        page=page,
        page_size=page_size,
    )
    return success_response(data=paginate(items, total, page, page_size))


@router.post("/{student_id}/certificates", response_model=dict)
async def request_certificate(
    student_id: str,
    request: CertificateRequestCreate,
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    db_request = await service.create_certificate_request(student_id, request)
    return success_response(data=CertificateRequestResponse.model_validate(db_request).model_dump())


@router.patch("/{student_id}/certificates/{cert_id}", response_model=dict)
async def update_certificate(
    student_id: str,
    cert_id: str,
    update_data: CertificateRequestUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    cert = await service.update_certificate(cert_id, update_data)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate request not found")
    return success_response(data=CertificateRequestResponse.model_validate(cert).model_dump())


@router.get("/{student_id}/certificates/{cert_id}/pdf", response_model=dict)
async def generate_certificate_pdf(
    student_id: str,
    cert_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    result = await service.generate_certificate_pdf(student_id, cert_id)
    return success_response(data=result)


@router.get("/certificates", response_model=dict)
async def list_all_certificates(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    items, total = await service.list_all_certificates(
        status=status,
        page=page,
        page_size=page_size,
    )
    return success_response(data=paginate(items, total, page, page_size))
