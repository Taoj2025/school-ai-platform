from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from .models import AppleFinanceRecord, AppleQuotation
from .schemas import FinanceRecordCreate, FinanceRecordResponse, QuotationCreate, QuotationResponse
from ....db.session import get_db
from ....common.schemas import success_response
from ....common.pagination import paginate

router = APIRouter(prefix="/apple/finance", tags=["apple-finance"])


@router.get("", response_model=dict)
async def list_finance_records(
    academic_year: Optional[str] = Query(None),
    record_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(AppleFinanceRecord)
    count_query = select(func.count()).select_from(AppleFinanceRecord)
    if academic_year:
        query = query.where(AppleFinanceRecord.academic_year == academic_year)
        count_query = count_query.where(AppleFinanceRecord.academic_year == academic_year)
    if record_type:
        query = query.where(AppleFinanceRecord.record_type == record_type)
        count_query = count_query.where(AppleFinanceRecord.record_type == record_type)
    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(AppleFinanceRecord.transaction_date.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = [FinanceRecordResponse.model_validate(r).model_dump() for r in result.scalars().all()]
    return success_response(data=paginate(items, total, page, page_size))


@router.post("", response_model=dict)
async def create_finance_record(record: FinanceRecordCreate, db: AsyncSession = Depends(get_db)):
    db_record = AppleFinanceRecord(**record.model_dump())
    db.add(db_record)
    await db.flush()
    return success_response(data=FinanceRecordResponse.model_validate(db_record).model_dump())


@router.get("/{record_id}", response_model=dict)
async def get_finance_record(record_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AppleFinanceRecord).where(AppleFinanceRecord.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Finance record not found")
    return success_response(data=FinanceRecordResponse.model_validate(record).model_dump())


@router.post("/quotations", response_model=dict)
async def create_quotation(quotation: QuotationCreate, db: AsyncSession = Depends(get_db)):
    db_quotation = AppleQuotation(**quotation.model_dump())
    db.add(db_quotation)
    await db.flush()
    return success_response(data=QuotationResponse.model_validate(db_quotation).model_dump())


@router.get("/quotations", response_model=dict)
async def list_quotations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    total = (await db.execute(select(func.count()).select_from(AppleQuotation))).scalar() or 0
    result = await db.execute(select(AppleQuotation).order_by(AppleQuotation.created_at.desc()).offset((page - 1) * page_size).limit(page_size))
    items = [QuotationResponse.model_validate(q).model_dump() for q in result.scalars().all()]
    return success_response(data=paginate(items, total, page, page_size))
