from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from .models import AppleFinanceRecord, AppleQuotation
from .schemas import (
    FinanceRecordCreate, FinanceRecordUpdate, FinanceRecordResponse,
    QuotationCreate, QuotationUpdate, QuotationResponse,
    QuotationAnalyzeResponse, AddressLabelRequest, AddressLabelResponse,
    FinanceStatsResponse,
)
from .service import FinanceService
from ....db.session import get_db
from ....common.schemas import success_response
from ....common.pagination import paginate

router = APIRouter(prefix="/apple/finance", tags=["apple-finance"])


@router.get("", response_model=dict)
async def list_finance_records(
    academic_year: Optional[str] = Query(None),
    record_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = FinanceService(db)
    items, total = await service.list_records(
        academic_year=academic_year,
        record_type=record_type,
        status=status,
        page=page,
        page_size=page_size,
    )
    return success_response(data=paginate(items, total, page, page_size))


@router.get("/stats", response_model=dict)
async def get_finance_stats(
    academic_year: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = FinanceService(db)
    stats = await service.get_stats(academic_year)
    return success_response(data=stats)


@router.get("/income", response_model=dict)
async def list_income_records(
    academic_year: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = FinanceService(db)
    items, total = await service.list_records(
        academic_year=academic_year,
        record_type="income",
        status=status,
        page=page,
        page_size=page_size,
    )
    return success_response(data=paginate(items, total, page, page_size))


@router.post("/income", response_model=dict)
async def create_income_record(
    record: FinanceRecordCreate,
    db: AsyncSession = Depends(get_db),
):
    service = FinanceService(db)
    db_record = await service.create_record(record, record_type="income")
    return success_response(data=FinanceRecordResponse.model_validate(db_record).model_dump())


@router.get("/expense", response_model=dict)
async def list_expense_records(
    academic_year: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = FinanceService(db)
    items, total = await service.list_records(
        academic_year=academic_year,
        record_type="expense",
        status=status,
        page=page,
        page_size=page_size,
    )
    return success_response(data=paginate(items, total, page, page_size))


@router.post("/expense", response_model=dict)
async def create_expense_record(
    record: FinanceRecordCreate,
    db: AsyncSession = Depends(get_db),
):
    service = FinanceService(db)
    db_record = await service.create_record(record, record_type="expense")
    return success_response(data=FinanceRecordResponse.model_validate(db_record).model_dump())


@router.get("/{record_id}", response_model=dict)
async def get_finance_record(record_id: str, db: AsyncSession = Depends(get_db)):
    service = FinanceService(db)
    record = await service.get_record(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Finance record not found")
    return success_response(data=FinanceRecordResponse.model_validate(record).model_dump())


@router.patch("/{record_id}", response_model=dict)
async def update_finance_record(
    record_id: str,
    update_data: FinanceRecordUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = FinanceService(db)
    record = await service.update_record(record_id, update_data)
    if not record:
        raise HTTPException(status_code=404, detail="Finance record not found")
    return success_response(data=FinanceRecordResponse.model_validate(record).model_dump())


@router.delete("/{record_id}", response_model=dict)
async def delete_finance_record(record_id: str, db: AsyncSession = Depends(get_db)):
    service = FinanceService(db)
    deleted = await service.delete_record(record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Finance record not found")
    return success_response(data={"deleted": True, "id": record_id})


@router.post("/quotations", response_model=dict)
async def create_quotation(quotation: QuotationCreate, db: AsyncSession = Depends(get_db)):
    service = FinanceService(db)
    db_quotation = await service.create_quotation(quotation)
    return success_response(data=QuotationResponse.model_validate(db_quotation).model_dump())


@router.get("/quotations", response_model=dict)
async def list_quotations(
    finance_record_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = FinanceService(db)
    items, total = await service.list_quotations(
        finance_record_id=finance_record_id,
        page=page,
        page_size=page_size,
    )
    return success_response(data=paginate(items, total, page, page_size))


@router.get("/quotations/{quotation_id}", response_model=dict)
async def get_quotation(quotation_id: str, db: AsyncSession = Depends(get_db)):
    service = FinanceService(db)
    quotation = await service.get_quotation(quotation_id)
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return success_response(data=QuotationResponse.model_validate(quotation).model_dump())


@router.patch("/quotations/{quotation_id}", response_model=dict)
async def update_quotation(
    quotation_id: str,
    update_data: QuotationUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = FinanceService(db)
    quotation = await service.update_quotation(quotation_id, update_data)
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return success_response(data=QuotationResponse.model_validate(quotation).model_dump())


@router.post("/quotations/{quotation_id}/analyze", response_model=dict)
async def analyze_quotation(quotation_id: str, db: AsyncSession = Depends(get_db)):
    service = FinanceService(db)
    result = await service.analyze_quotation(quotation_id)
    return success_response(data=result)


@router.post("/address-labels", response_model=dict)
async def generate_address_labels(
    request: AddressLabelRequest,
    db: AsyncSession = Depends(get_db),
):
    service = FinanceService(db)
    result = await service.generate_address_labels(request)
    return success_response(data=result)
