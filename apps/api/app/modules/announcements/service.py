import uuid
import json
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import Announcement, AnnouncementTemplate, SendLog
from .schemas import (
    AnnouncementCreate, AnnouncementUpdate,
    AnnouncementInput, BilingualAnnouncement,
    TemplateCreate, TemplateUpdate,
)


class AnnouncementService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def list_announcements(
        self,
        academic_year: Optional[str] = None,
        semester: Optional[str] = None,
        announcement_type: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ):
        query = select(Announcement)
        count_query = select(func.count()).select_from(Announcement)
        
        if academic_year:
            query = query.where(Announcement.academic_year == academic_year)
            count_query = count_query.where(Announcement.academic_year == academic_year)
        if semester:
            query = query.where(Announcement.semester == semester)
            count_query = count_query.where(Announcement.semester == semester)
        if announcement_type:
            query = query.where(Announcement.announcement_type == announcement_type)
            count_query = count_query.where(Announcement.announcement_type == announcement_type)
        if status:
            query = query.where(Announcement.status == status)
            count_query = count_query.where(Announcement.status == status)
        
        total = (await self.db.execute(count_query)).scalar() or 0
        query = query.order_by(Announcement.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        announcements = result.scalars().all()
        
        items = [self._announcement_to_dict(a) for a in announcements]
        return items, total
    
    def _announcement_to_dict(self, a: Announcement) -> dict:
        return {
            "id": a.id,
            "title_zh": a.title_zh,
            "title_en": a.title_en,
            "body_zh": a.body_zh,
            "body_en": a.body_en,
            "announcement_type": a.announcement_type,
            "target_audience": a.target_audience,
            "academic_year": a.academic_year,
            "semester": a.semester,
            "key_dates": a.key_dates,
            "key_location": a.key_location,
            "subject": a.subject,
            "teachers": a.teachers,
            "special_notes": a.special_notes,
            "formality": a.formality,
            "status": a.status,
            "template_id": a.template_id,
            "ai_generated": a.ai_generated,
            "ai_confidence": a.ai_confidence,
            "ai_warnings": a.ai_warnings,
            "created_by": a.created_by,
            "approved_by": a.approved_by,
            "sent_at": a.sent_at,
            "created_at": a.created_at,
            "updated_at": a.updated_at,
        }
    
    async def get_announcement(self, announcement_id: str) -> Optional[Announcement]:
        result = await self.db.execute(
            select(Announcement).where(Announcement.id == announcement_id)
        )
        return result.scalar_one_or_none()
    
    async def create_announcement(self, data: AnnouncementCreate) -> Announcement:
        db_ann = Announcement(
            id=str(uuid.uuid4()),
            title_zh=data.title_zh,
            title_en=data.title_en,
            body_zh=data.body_zh,
            body_en=data.body_en,
            announcement_type=data.announcement_type,
            target_audience=data.target_audience,
            academic_year=data.academic_year,
            semester=data.semester,
            key_dates=[d.isoformat() if isinstance(d, datetime) else d for d in data.key_dates] if data.key_dates else None,
            key_location=data.key_location,
            subject=data.subject,
            teachers=data.teachers,
            special_notes=data.special_notes,
            formality=data.formality,
            template_id=data.template_id,
            status="draft",
            ai_generated=False,
        )
        self.db.add(db_ann)
        await self.db.flush()
        return db_ann
    
    async def update_announcement(
        self,
        announcement_id: str,
        update_data: AnnouncementUpdate
    ) -> Optional[Announcement]:
        ann = await self.get_announcement(announcement_id)
        if not ann:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if hasattr(ann, key):
                setattr(ann, key, value)
        
        ann.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return ann
    
    async def delete_announcement(self, announcement_id: str) -> bool:
        ann = await self.get_announcement(announcement_id)
        if not ann:
            return False
        
        await self.db.delete(ann)
        await self.db.flush()
        return True
    
    async def generate_bilingual(
        self,
        input_data: AnnouncementInput,
        user_id: Optional[str] = None,
    ) -> dict:
        prompt = self._build_prompt(input_data)
        
        try:
            from app.workers.llm_tasks import call_llm_unified
            result = call_llm_unified.delay(
                task_type="bilingual_announcement",
                prompt=prompt,
                model="gpt-4o-mini",
            )
            return {
                "status": "processing",
                "message": "AI generation task submitted",
            }
        except Exception:
            fallback_result = self._generate_fallback(input_data)
            announcement = await self.create_announcement(
                AnnouncementCreate(
                    title_zh=fallback_result.title_zh,
                    title_en=fallback_result.title_en,
                    body_zh=fallback_result.body_zh,
                    body_en=fallback_result.body_en,
                    announcement_type=input_data.title_type,
                    target_audience=input_data.target_audience,
                    academic_year="",
                    semester="",
                    key_dates=input_data.key_dates,
                    key_location=input_data.key_location,
                    subject=input_data.subject,
                    teachers=input_data.teachers,
                    special_notes=input_data.special_notes,
                    formality=input_data.formality,
                )
            )
            announcement.ai_generated = True
            announcement.ai_confidence = "medium"
            announcement.ai_warnings = fallback_result.warnings
            await self.db.flush()
            
            return {
                "status": "completed",
                "announcement_id": announcement.id,
                "result": fallback_result.model_dump(),
            }
    
    def _build_prompt(self, data: AnnouncementInput) -> str:
        dates_str = ", ".join([
            d.strftime("%Y年%m月%d日") if hasattr(d, 'strftime') else str(d)
            for d in (data.key_dates or [])
        ])
        
        teachers_str = ", ".join(data.teachers) if data.teachers else "N/A"
        
        return f"""你是香港培英文具学校的文案助手。请根据以下信息撰写中英双语公告。

# 学校信息
- 校名：香港培英文具学校 (PUI YING MIDDLE SCHOOL)
- 正式场合使用严谨中文，日常使用口语化中文

# 公告类型
{data.title_type}

# 必含信息
- 日期：{dates_str}
- 地点：{data.key_location or 'N/A'}
- 受众：{data.target_audience}
- 科目：{data.subject or 'N/A'}
- 负责老师：{teachers_str}
- 特殊要求：{data.special_notes or '无'}

# 格式要求（JSON）：
{{
  "title_zh": "中文标题（不超过20字）",
  "title_en": "English Title (no more than 15 words)",
  "body_zh": "中文正文（100-500字）",
  "body_en": "English body (150-250 words)",
  "confidence": "high/medium/low",
  "warnings": ["如有不合理之处列在此处"]
}}

# 特别提示
1. 中英信息必须一致
2. 日期格式：中文用年月日，英文用Month X, 2026
3. 校名英文固定为 Pui Ying Middle School, Hong Kong
4. 如有不通用瑾，请再warnings中列出"""
    
    def _generate_fallback(self, input_data: AnnouncementInput) -> BilingualAnnouncement:
        type_map = {
            "exam": ("考试通知", "EXAMINATION NOTICE"),
            "holiday": ("假期通知", "HOLIDAY NOTICE"),
            "payment": ("缴费通知", "PAYMENT NOTICE"),
            "weather": ("天气通知", "WEATHER NOTICE"),
            "activity": ("活动通知", "ACTIVITY NOTICE"),
            "other": ("通知", "NOTICE"),
        }
        
        zh_type, en_type = type_map.get(input_data.title_type, ("通知", "NOTICE"))
        
        dates_str = ", ".join([
            d.strftime("%Y年%m月%d日") if hasattr(d, 'strftime') else str(d)
            for d in (input_data.key_dates or [datetime.now()])
        ])
        
        return BilingualAnnouncement(
            title_zh=f"{zh_type}",
            title_en=en_type,
            body_zh=f"各位{'家长' if input_data.target_audience == 'whole_school' else '同学'}：\n\n兹通知{input_data.title_type}，请知悉。\n\n日期：{dates_str}\n地点：{input_data.key_location or '待定'}\n\n如有疑问，请联系学校办公室。\n\n香港培英文具学校",
            body_en=f"Dear Parents/Students,\n\nThis is to notify you of an upcoming {input_data.title_type}.\n\nDate: {dates_str}\nLocation: {input_data.key_location or 'To be confirmed'}\n\nShould you have any enquiries, please contact the school office.\n\nPui Ying Middle School, Hong Kong",
            confidence="medium",
            warnings=["使用占位符，实际数据请在生成后修改"],
        )
    
    async def approve_announcement(
        self,
        announcement_id: str,
        approver_id: str,
    ) -> Optional[Announcement]:
        ann = await self.get_announcement(announcement_id)
        if not ann:
            return None
        
        ann.status = "approved"
        ann.approved_by = approver_id
        ann.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return ann
    
    async def submit_for_approval(self, announcement_id: str) -> Optional[Announcement]:
        ann = await self.get_announcement(announcement_id)
        if not ann:
            return None
        
        ann.status = "pending_approval"
        ann.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return ann
    
    async def send_announcement(self, announcement_id: str) -> Optional[Announcement]:
        ann = await self.get_announcement(announcement_id)
        if not ann:
            return None
        
        ann.status = "sent"
        ann.sent_at = datetime.now(timezone.utc)
        ann.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return ann
    
    async def get_read_status(self, announcement_id: str) -> dict:
        result = await self.db.execute(
            select(SendLog).where(SendLog.announcement_id == announcement_id)
        )
        logs = result.scalars().all()
        
        total = len(logs)
        sent = sum(1 for l in logs if l.status in ("sent", "delivered", "read"))
        delivered = sum(1 for l in logs if l.status in ("delivered", "read"))
        read = sum(1 for l in logs if l.status == "read")
        pending = sum(1 for l in logs if l.status == "pending")
        
        return {
            "total_recipients": total,
            "sent_count": sent,
            "delivered_count": delivered,
            "read_count": read,
            "pending_count": pending,
            "read_rate": round(read / sent, 2) if sent > 0 else 0,
        }


class TemplateService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def list_templates(
        self,
        category: Optional[str] = None,
        is_active: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ):
        query = select(AnnouncementTemplate)
        count_query = select(func.count()).select_from(AnnouncementTemplate)
        
        if category:
            query = query.where(AnnouncementTemplate.category == category)
            count_query = count_query.where(AnnouncementTemplate.category == category)
        if is_active is not None:
            query = query.where(AnnouncementTemplate.is_active == is_active)
            count_query = count_query.where(AnnouncementTemplate.is_active == is_active)
        
        total = (await self.db.execute(count_query)).scalar() or 0
        query = query.order_by(AnnouncementTemplate.usage_count.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        templates = result.scalars().all()
        
        items = [self._template_to_dict(t) for t in templates]
        return items, total
    
    def _template_to_dict(self, t: AnnouncementTemplate) -> dict:
        return {
            "id": t.id,
            "name": t.name,
            "category": t.category,
            "title_zh_template": t.title_zh_template,
            "title_en_template": t.title_en_template,
            "body_zh_template": t.body_zh_template,
            "body_en_template": t.body_en_template,
            "required_params": t.required_params,
            "is_active": t.is_active,
            "usage_count": t.usage_count,
            "avg_rating": t.avg_rating,
            "created_at": t.created_at,
        }
    
    async def get_template(self, template_id: str) -> Optional[AnnouncementTemplate]:
        result = await self.db.execute(
            select(AnnouncementTemplate).where(AnnouncementTemplate.id == template_id)
        )
        return result.scalar_one_or_none()
    
    async def create_template(self, data: TemplateCreate) -> AnnouncementTemplate:
        db_template = AnnouncementTemplate(
            id=str(uuid.uuid4()),
            name=data.name,
            category=data.category,
            title_zh_template=data.title_zh_template,
            title_en_template=data.title_en_template,
            body_zh_template=data.body_zh_template,
            body_en_template=data.body_en_template,
            required_params=data.required_params,
            is_active=True,
            usage_count=0,
        )
        self.db.add(db_template)
        await self.db.flush()
        return db_template
    
    async def update_template(
        self,
        template_id: str,
        update_data: TemplateUpdate,
    ) -> Optional[AnnouncementTemplate]:
        template = await self.get_template(template_id)
        if not template:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if hasattr(template, key):
                setattr(template, key, value)
        
        template.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return template
    
    async def recommend_templates(self, partial_input: dict) -> list[AnnouncementTemplate]:
        category = partial_input.get("announcement_type")
        
        query = select(AnnouncementTemplate).where(AnnouncementTemplate.is_active == True)
        if category:
            query = query.where(AnnouncementTemplate.category == category)
        
        query = query.order_by(AnnouncementTemplate.usage_count.desc()).limit(3)
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def increment_usage(self, template_id: str):
        template = await self.get_template(template_id)
        if template:
            template.usage_count += 1
            await self.db.flush()
