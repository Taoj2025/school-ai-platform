from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from .models import AppleStudent, AppleAttendance, AppleCertificateRequest
from .schemas import (
    StudentCreate, StudentResponse,
    AttendanceCreate, AttendanceResponse,
    CertificateRequestCreate, CertificateRequestResponse,
)
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
    query = select(AppleStudent)
    count_query = select(func.count()).select_from(AppleStudent)
    if class_name:
        query = query.where(AppleStudent.class_name == class_name)
        count_query = count_query.where(AppleStudent.class_name == class_name)
    if status:
        query = query.where(AppleStudent.status == status)
        count_query = count_query.where(AppleStudent.status == status)
    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(AppleStudent.class_name, AppleStudent.name_en).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = [StudentResponse.model_validate(s).model_dump() for s in result.scalars().all()]
    return success_response(data=paginate(items, total, page, page_size))


@router.post("", response_model=dict)
async def create_student(student: StudentCreate, db: AsyncSession = Depends(get_db)):
    db_student = AppleStudent(**student.model_dump())
    db.add(db_student)
    await db.flush()
    return success_response(data=StudentResponse.model_validate(db_student).model_dump())


@router.get("/{student_id}", response_model=dict)
async def get_student(student_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AppleStudent).where(AppleStudent.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return success_response(data=StudentResponse.model_validate(student).model_dump())


@router.post("/attendance", response_model=dict)
async def record_attendance(record: AttendanceCreate, db: AsyncSession = Depends(get_db)):
    db_record = AppleAttendance(**record.model_dump())
    db.add(db_record)
    await db.flush()
    return success_response(data=AttendanceResponse.model_validate(db_record).model_dump())


@router.get("/attendance", response_model=dict)
async def list_attendance(
    student_id: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(AppleAttendance)
    count_query = select(func.count()).select_from(AppleAttendance)
    if student_id:
        query = query.where(AppleAttendance.student_id == student_id)
        count_query = count_query.where(AppleAttendance.student_id == student_id)
    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(AppleAttendance.date.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = [AttendanceResponse.model_validate(a).model_dump() for a in result.scalars().all()]
    return success_response(data=paginate(items, total, page, page_size))


@router.post("/certificates", response_model=dict)
async def request_certificate(request: CertificateRequestCreate, db: AsyncSession = Depends(get_db)):
    db_request = AppleCertificateRequest(**request.model_dump())
    db.add(db_request)
    await db.flush()
    return success_response(data=CertificateRequestResponse.model_validate(db_request).model_dump())


@router.get("/certificates", response_model=dict)
async def list_certificates(
    student_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(AppleCertificateRequest)
    count_query = select(func.count()).select_from(AppleCertificateRequest)
    if student_id:
        query = query.where(AppleCertificateRequest.student_id == student_id)
        count_query = count_query.where(AppleCertificateRequest.student_id == student_id)
    if status:
        query = query.where(AppleCertificateRequest.status == status)
        count_query = count_query.where(AppleCertificateRequest.status == status)
    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(AppleCertificateRequest.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = [CertificateRequestResponse.model_validate(c).model_dump() for c in result.scalars().all()]
    return success_response(data=paginate(items, total, page, page_size))
