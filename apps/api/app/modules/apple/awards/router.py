from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from .models import AppleAward, AppleAwardRecipient
from .schemas import AwardCreate, AwardResponse, AwardRecipientCreate, AwardRecipientResponse
from ....db.session import get_db
from ....common.schemas import success_response
from ....common.pagination import paginate

router = APIRouter(prefix="/apple/awards", tags=["apple-awards"])


@router.get("", response_model=dict)
async def list_awards(
    academic_year: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(AppleAward)
    count_query = select(func.count()).select_from(AppleAward)
    if academic_year:
        query = query.where(AppleAward.academic_year == academic_year)
        count_query = count_query.where(AppleAward.academic_year == academic_year)
    if status:
        query = query.where(AppleAward.status == status)
        count_query = count_query.where(AppleAward.status == status)
    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(AppleAward.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = [AwardResponse.model_validate(a).model_dump() for a in result.scalars().all()]
    return success_response(data=paginate(items, total, page, page_size))


@router.post("", response_model=dict)
async def create_award(award: AwardCreate, db: AsyncSession = Depends(get_db)):
    db_award = AppleAward(**award.model_dump())
    db.add(db_award)
    await db.flush()
    return success_response(data=AwardResponse.model_validate(db_award).model_dump())


@router.get("/{award_id}", response_model=dict)
async def get_award(award_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AppleAward).where(AppleAward.id == award_id))
    award = result.scalar_one_or_none()
    if not award:
        raise HTTPException(status_code=404, detail="Award not found")
    return success_response(data=AwardResponse.model_validate(award).model_dump())


@router.post("/{award_id}/recipients", response_model=dict)
async def add_recipient(award_id: str, recipient: AwardRecipientCreate, db: AsyncSession = Depends(get_db)):
    db_recipient = AppleAwardRecipient(award_id=award_id, **recipient.model_dump(exclude={"award_id"}))
    db.add(db_recipient)
    await db.flush()
    return success_response(data=AwardRecipientResponse.model_validate(db_recipient).model_dump())


@router.get("/{award_id}/recipients", response_model=dict)
async def list_recipients(award_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AppleAwardRecipient).where(AppleAwardRecipient.award_id == award_id))
    items = [AwardRecipientResponse.model_validate(r).model_dump() for r in result.scalars().all()]
    return success_response(data={"items": items, "total": len(items)})
