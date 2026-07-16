import uuid
from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from decimal import Decimal
from .models import AppleAward, AppleAwardRecipient
from .schemas import (
    AwardCreate, AwardUpdate,
    AwardRecipientCreate, AwardRecipientUpdate, AwardRecipientResponse,
    ScholarshipCalculationRequest,
    CertificateGenerationRequest,
    ScriptGenerationRequest,
)


class AwardService:
    """Service for managing awards and scholarships."""
    
    # Default scholarship amounts by award type
    DEFAULT_AMOUNTS = {
        "academic": 1000.0,    # Academic awards
        "conduct": 500.0,       # Conduct/behavior awards
        "service": 500.0,       # Service awards
        "sports": 300.0,        # Sports awards
        "arts": 300.0,          # Arts/music awards
    }
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def list_awards(
        self,
        academic_year: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ):
        """List awards with pagination and filtering."""
        query = select(AppleAward)
        count_query = select(func.count()).select_from(AppleAward)
        
        if academic_year:
            query = query.where(AppleAward.academic_year == academic_year)
            count_query = count_query.where(AppleAward.academic_year == academic_year)
        if status:
            query = query.where(AppleAward.status == status)
            count_query = count_query.where(AppleAward.status == status)
        
        total = (await self.db.execute(count_query)).scalar() or 0
        query = query.order_by(AppleAward.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        awards = result.scalars().all()
        
        items = [{
            "id": a.id,
            "name": a.name,
            "award_type": a.award_type,
            "academic_year": a.academic_year,
            "semester": a.semester,
            "description": a.description,
            "amount": float(a.amount) if a.amount else None,
            "status": a.status,
            "created_at": a.created_at,
            "updated_at": a.updated_at,
        } for a in awards]
        
        return items, total
    
    async def get_award(self, award_id: str) -> Optional[AppleAward]:
        """Get a single award by ID."""
        result = await self.db.execute(
            select(AppleAward).where(AppleAward.id == award_id)
        )
        return result.scalar_one_or_none()
    
    async def create_award(self, award_data: AwardCreate) -> AppleAward:
        """Create a new award."""
        db_award = AppleAward(
            id=str(uuid.uuid4()),
            name=award_data.name,
            award_type=award_data.award_type,
            academic_year=award_data.academic_year,
            semester=award_data.semester,
            description=award_data.description,
            amount=Decimal(str(award_data.amount)) if award_data.amount else None,
            status="draft",
        )
        self.db.add(db_award)
        await self.db.flush()
        return db_award
    
    async def update_award(self, award_id: str, update_data: AwardUpdate) -> Optional[AppleAward]:
        """Update an existing award."""
        award = await self.get_award(award_id)
        if not award:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if key == "amount" and value is not None:
                value = Decimal(str(value))
            if hasattr(award, key):
                setattr(award, key, value)
        
        award.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return award
    
    async def delete_award(self, award_id: str) -> bool:
        """Delete an award and its recipients."""
        award = await self.get_award(award_id)
        if not award:
            return False
        
        await self.db.execute(
            delete(AppleAwardRecipient).where(AppleAwardRecipient.award_id == award_id)
        )
        await self.db.delete(award)
        await self.db.flush()
        return True
    
    async def add_recipient(self, award_id: str, recipient_data: AwardRecipientCreate) -> AppleAwardRecipient:
        """Add a recipient to an award."""
        db_recipient = AppleAwardRecipient(
            id=str(uuid.uuid4()),
            award_id=award_id,
            student_id=recipient_data.student_id,
            student_name=recipient_data.student_name,
            class_name=recipient_data.class_name,
            reason=recipient_data.reason,
            amount=Decimal(str(recipient_data.amount)) if recipient_data.amount else None,
            status="nominated",
        )
        self.db.add(db_recipient)
        await self.db.flush()
        return db_recipient
    
    async def list_recipients(self, award_id: str):
        """List recipients for an award."""
        result = await self.db.execute(
            select(AppleAwardRecipient)
            .where(AppleAwardRecipient.award_id == award_id)
            .order_by(AppleAwardRecipient.class_name, AppleAwardRecipient.student_name)
        )
        recipients = result.scalars().all()
        
        items = [AwardRecipientResponse.model_validate(r).model_dump() for r in recipients]
        return items, len(items)
    
    async def update_recipient(self, recipient_id: str, update_data: AwardRecipientUpdate) -> Optional[AppleAwardRecipient]:
        """Update a recipient."""
        result = await self.db.execute(
            select(AppleAwardRecipient).where(AppleAwardRecipient.id == recipient_id)
        )
        recipient = result.scalar_one_or_none()
        if not recipient:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if key == "amount" and value is not None:
                value = Decimal(str(value))
            if hasattr(recipient, key):
                setattr(recipient, key, value)
        
        await self.db.flush()
        return recipient
    
    async def calculate_scholarships(
        self,
        award_id: str,
        request: ScholarshipCalculationRequest,
    ) -> dict:
        """
        Calculate scholarships for award recipients.
        
        Uses default amounts based on award type or custom amounts if provided.
        """
        award = await self.get_award(award_id)
        if not award:
            raise ValueError("Award not found")
        
        # Get recipients
        result = await self.db.execute(
            select(AppleAwardRecipient)
            .where(AppleAwardRecipient.award_id == award_id)
            .where(AppleAwardRecipient.id.in_(request.recipient_ids))
        )
        recipients = result.scalars().all()
        
        # Determine default amount from award type
        award_type_key = award.award_type.lower()
        default_amount = self.DEFAULT_AMOUNTS.get(award_type_key, 500.0)
        
        breakdown = []
        total_amount = 0.0
        
        for recipient in recipients:
            # Use custom amount if provided, otherwise use default
            if request.custom_amounts and recipient.id in request.custom_amounts:
                amount = request.custom_amounts[recipient.id]
            else:
                amount = default_amount
            
            breakdown.append({
                "recipient_id": recipient.id,
                "student_id": recipient.student_id,
                "student_name": recipient.student_name,
                "class_name": recipient.class_name,
                "amount": amount,
            })
            total_amount += amount
            
            # Update recipient amount in database
            recipient.amount = Decimal(str(amount))
            recipient.status = "approved"
        
        # Update award status
        award.status = "approved"
        await self.db.flush()
        
        return {
            "award_id": award_id,
            "total_recipients": len(recipients),
            "total_amount": total_amount,
            "default_amount_per_recipient": default_amount,
            "breakdown": breakdown,
        }
    
    async def generate_certificates(
        self,
        award_id: str,
        request: CertificateGenerationRequest,
    ) -> dict:
        """
        Generate certificates for award recipients.
        
        Returns certificate IDs and download URL.
        In production, this would use docxtpl to generate actual PDF files.
        """
        award = await self.get_award(award_id)
        if not award:
            raise ValueError("Award not found")
        
        # Get recipients
        result = await self.db.execute(
            select(AppleAwardRecipient)
            .where(AppleAwardRecipient.award_id == award_id)
            .where(AppleAwardRecipient.id.in_(request.recipient_ids))
        )
        recipients = result.scalars().all()
        
        certificate_ids = []
        ceremony_date = request.ceremony_date or date.today()
        
        for recipient in recipients:
            # Generate certificate record (in production, this would create actual PDF)
            cert_id = str(uuid.uuid4())
            certificate_ids.append(cert_id)
            
            # Update recipient status
            recipient.status = "certificate_generated"
        
        award.status = "completed"
        await self.db.flush()
        
        # Generate download URL (mock for now)
        download_url = f"/api/v1/apple/awards/{award_id}/certificates/download"
        
        return {
            "certificate_ids": certificate_ids,
            "download_url": download_url,
            "total_generated": len(certificate_ids),
            "award_name": award.name,
            "ceremony_date": ceremony_date.isoformat(),
            "signatory": request.signatory,
        }
    
    async def generate_script(
        self,
        award_id: str,
        request: ScriptGenerationRequest,
    ) -> dict:
        """
        Generate ceremony script for award distribution.
        
        Groups recipients by grade, class, or student number.
        """
        award = await self.get_award(award_id)
        if not award:
            raise ValueError("Award not found")
        
        # Get recipients
        result = await self.db.execute(
            select(AppleAwardRecipient)
            .where(AppleAwardRecipient.award_id == award_id)
        )
        recipients = result.scalars().all()
        
        if not recipients:
            return {
                "script": "No recipients found for this award.",
                "recipient_count": 0,
                "grouped_by": request.group_by,
            }
        
        # Group recipients
        groups: dict = {}
        for r in recipients:
            if request.group_by == "grade":
                # Extract grade from class_name (e.g., "F.1A" -> "F.1")
                key = r.class_name[:-1] if r.class_name and len(r.class_name) > 1 else r.class_name
            elif request.group_by == "class":
                key = r.class_name or "Unknown"
            else:  # student_no
                key = r.student_id[:4] if r.student_id else "Unknown"  # First 4 chars of student ID
            
            if key not in groups:
                groups[key] = []
            groups[key].append(r)
        
        # Sort groups
        sorted_keys = sorted(groups.keys())
        
        # Build script
        script_lines = [
            f"Award Ceremony Script",
            f"========================",
            f"",
            f"Award: {award.name}",
            f"Type: {award.award_type}",
            f"Academic Year: {award.academic_year}",
            f"",
            f"Total Recipients: {len(recipients)}",
            f"",
        ]
        
        if request.group_by == "grade":
            script_lines.append("Presentation Order by Grade:")
        elif request.group_by == "class":
            script_lines.append("Presentation Order by Class:")
        else:
            script_lines.append("Presentation Order by Student Number:")
        
        script_lines.append("")
        
        for key in sorted_keys:
            group_recipients = groups[key]
            script_lines.append(f"--- {key} ---")
            
            for i, r in enumerate(group_recipients, 1):
                line = f"{i}. {r.student_name or r.student_id}"
                if r.class_name:
                    line += f" ({r.class_name})"
                if request.include_amounts and r.amount:
                    line += f" - HK$ {float(r.amount):,.0f}"
                script_lines.append(line)
            
            script_lines.append("")
        
        return {
            "script": "\n".join(script_lines),
            "recipient_count": len(recipients),
            "grouped_by": request.group_by,
            "groups": {k: len(v) for k, v in groups.items()},
        }
