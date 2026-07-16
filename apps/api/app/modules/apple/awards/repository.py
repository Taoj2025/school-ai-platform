from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from .models import AppleAward, AppleAwardRecipient


class AwardRepository:
    """Repository for award data access."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, award_id: str) -> Optional[AppleAward]:
        """Get award by ID."""
        result = await self.db.execute(
            select(AppleAward).where(AppleAward.id == award_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_id_with_recipients(self, award_id: str) -> Optional[AppleAward]:
        """Get award with its recipients."""
        result = await self.db.execute(
            select(AppleAward)
            .where(AppleAward.id == award_id)
        )
        return result.scalar_one_or_none()
    
    async def get_recipient_by_id(self, recipient_id: str) -> Optional[AppleAwardRecipient]:
        """Get recipient by ID."""
        result = await self.db.execute(
            select(AppleAwardRecipient).where(AppleAwardRecipient.id == recipient_id)
        )
        return result.scalar_one_or_none()
    
    async def list_recipients_by_award(self, award_id: str) -> List[AppleAwardRecipient]:
        """Get all recipients for an award."""
        result = await self.db.execute(
            select(AppleAwardRecipient)
            .where(AppleAwardRecipient.award_id == award_id)
            .order_by(AppleAwardRecipient.class_name, AppleAwardRecipient.student_name)
        )
        return list(result.scalars().all())
    
    async def count_recipients(self, award_id: str) -> int:
        """Count recipients for an award."""
        result = await self.db.execute(
            select(func.count()).select_from(AppleAwardRecipient)
            .where(AppleAwardRecipient.award_id == award_id)
        )
        return result.scalar() or 0
    
    async def sum_scholarship_amount(self, award_id: str) -> float:
        """Sum of scholarship amounts for an award."""
        result = await self.db.execute(
            select(func.coalesce(func.sum(AppleAwardRecipient.amount), 0))
            .where(AppleAwardRecipient.award_id == award_id)
        )
        return float(result.scalar() or 0)
    
    async def delete_recipients(self, award_id: str) -> int:
        """Delete all recipients for an award. Returns count deleted."""
        result = await self.db.execute(
            delete(AppleAwardRecipient)
            .where(AppleAwardRecipient.award_id == award_id)
        )
        return result.rowcount or 0
    
    async def get_recipients_by_ids(self, recipient_ids: List[str]) -> List[AppleAwardRecipient]:
        """Get recipients by list of IDs."""
        result = await self.db.execute(
            select(AppleAwardRecipient)
            .where(AppleAwardRecipient.id.in_(recipient_ids))
        )
        return list(result.scalars().all())
