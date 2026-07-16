from app.modules.apple.awards.models import Award, AwardRecipient
from app.modules.apple.awards.repository import AwardRepository
from app.modules.apple.awards.schemas import AwardCreate, AwardRecipientCreate
from app.common.errors import NotFoundError


class AwardService:
    def __init__(self, repo: AwardRepository):
        self.repo = repo

    async def list_awards(self, offset: int = 0, limit: int = 20) -> list[Award]:
        return await self.repo.list(offset, limit)

    async def get_award(self, award_id: str) -> Award:
        award = await self.repo.get_by_id(award_id)
        if not award:
            raise NotFoundError(f"Award {award_id} not found")
        return award

    async def create_award(self, data: AwardCreate, user_id: str) -> Award:
        award = Award(
            name=data.name,
            category=data.category,
            amount=data.amount,
            semester=data.semester,
            year=data.year,
            created_by=user_id,
        )
        return await self.repo.create(award)

    async def add_recipient(self, award_id: str, data: AwardRecipientCreate, user_id: str) -> AwardRecipient:
        award = await self.get_award(award_id)
        recipient = AwardRecipient(
            award_id=award.id,
            student_id=data.student_id,
            score=data.score,
            ranking=data.ranking,
            created_by=user_id,
        )
        return await self.repo.add_recipient(recipient)
