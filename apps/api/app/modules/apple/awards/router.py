from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.schemas import ResponseSchema
from app.core.permissions import get_current_user
from app.db.session import get_db
from app.modules.apple.awards.repository import AwardRepository
from app.modules.apple.awards.schemas import AwardCreate, AwardRead, AwardRecipientCreate, AwardRecipientRead
from app.modules.apple.awards.service import AwardService

router = APIRouter(prefix="/apple/awards", tags=["Apple - Awards"])


@router.get("", response_model=ResponseSchema[list[AwardRead]])
async def list_awards(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = AwardService(AwardRepository(db))
    awards = await service.list_awards()
    return ResponseSchema(data=[AwardRead.model_validate(a) for a in awards], meta={})


@router.post("", response_model=ResponseSchema[AwardRead])
async def create_award(
    data: AwardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = AwardService(AwardRepository(db))
    award = await service.create_award(data, current_user["user_id"])
    return ResponseSchema(data=AwardRead.model_validate(award), meta={})


@router.get("/{award_id}", response_model=ResponseSchema[AwardRead])
async def get_award(
    award_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = AwardService(AwardRepository(db))
    award = await service.get_award(award_id)
    return ResponseSchema(data=AwardRead.model_validate(award), meta={})


@router.post("/{award_id}/recipients", response_model=ResponseSchema[AwardRecipientRead])
async def add_recipient(
    award_id: str,
    data: AwardRecipientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = AwardService(AwardRepository(db))
    recipient = await service.add_recipient(award_id, data, current_user["user_id"])
    return ResponseSchema(data=AwardRecipientRead.model_validate(recipient), meta={})
