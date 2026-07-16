from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.schemas import ResponseSchema
from app.core.permissions import get_current_user
from app.db.session import get_db
from app.modules.apple.finance.repository import FinanceRepository
from app.modules.apple.finance.schemas import FinanceRecordCreate, FinanceRecordRead, QuotationCreate, QuotationRead
from app.modules.apple.finance.service import FinanceService

router = APIRouter(prefix="/apple/finance", tags=["Apple - Finance"])


@router.get("/income", response_model=ResponseSchema[list[FinanceRecordRead]])
async def list_income(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = FinanceService(FinanceRepository(db))
    records = await service.list_records(record_type="income")
    return ResponseSchema(data=[FinanceRecordRead.model_validate(r) for r in records], meta={})


@router.post("/income", response_model=ResponseSchema[FinanceRecordRead])
async def create_income(
    data: FinanceRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = FinanceService(FinanceRepository(db))
    record = await service.create_record(data.model_copy(update={"record_type": "income"}), current_user["user_id"])
    return ResponseSchema(data=FinanceRecordRead.model_validate(record), meta={})


@router.get("/expense", response_model=ResponseSchema[list[FinanceRecordRead]])
async def list_expense(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = FinanceService(FinanceRepository(db))
    records = await service.list_records(record_type="expense")
    return ResponseSchema(data=[FinanceRecordRead.model_validate(r) for r in records], meta={})


@router.post("/expense", response_model=ResponseSchema[FinanceRecordRead])
async def create_expense(
    data: FinanceRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = FinanceService(FinanceRepository(db))
    record = await service.create_record(data.model_copy(update={"record_type": "expense"}), current_user["user_id"])
    return ResponseSchema(data=FinanceRecordRead.model_validate(record), meta={})


@router.get("/quotations", response_model=ResponseSchema[list[QuotationRead]])
async def list_quotations(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = FinanceService(FinanceRepository(db))
    quotations = await service.list_quotations()
    return ResponseSchema(data=[QuotationRead.model_validate(q) for q in quotations], meta={})


@router.post("/quotations", response_model=ResponseSchema[QuotationRead])
async def create_quotation(
    data: QuotationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = FinanceService(FinanceRepository(db))
    quotation = await service.create_quotation(data, current_user["user_id"])
    return ResponseSchema(data=QuotationRead.model_validate(quotation), meta={})
