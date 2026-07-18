from typing import List, Optional, Tuple
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from .models import ExamSession, Score, GeneratedComment, CommentFeedback, RegressionAlert


class GradeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_exam_session(self, exam_session: ExamSession) -> ExamSession:
        self.db.add(exam_session)
        await self.db.commit()
        await self.db.refresh(exam_session)
        return exam_session

    async def get_exam_session(self, session_id: str) -> Optional[ExamSession]:
        result = await self.db.execute(
            select(ExamSession).where(ExamSession.id == session_id)
        )
        return result.scalar_one_or_none()

    async def list_exam_sessions(
        self,
        semester: Optional[str] = None,
        subject: Optional[str] = None,
        grade: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[ExamSession], int]:
        query = select(ExamSession)
        count_query = select(func.count(ExamSession.id))

        if semester:
            query = query.where(ExamSession.semester == semester)
            count_query = count_query.where(ExamSession.semester == semester)
        if subject:
            query = query.where(ExamSession.subject == subject)
            count_query = count_query.where(ExamSession.subject == subject)
        if grade:
            query = query.where(ExamSession.grade == grade)
            count_query = count_query.where(ExamSession.grade == grade)
        if status:
            query = query.where(ExamSession.status == status)
            count_query = count_query.where(ExamSession.status == status)

        query = query.order_by(desc(ExamSession.exam_date))
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(query)
        count_result = await self.db.execute(count_query)

        return result.scalars().all(), count_result.scalar()

    async def create_score(self, score: Score) -> Score:
        self.db.add(score)
        await self.db.commit()
        await self.db.refresh(score)
        return score

    async def bulk_create_scores(self, scores: List[Score]) -> List[Score]:
        self.db.add_all(scores)
        await self.db.commit()
        for score in scores:
            await self.db.refresh(score)
        return scores

    async def get_score(self, score_id: str) -> Optional[Score]:
        result = await self.db.execute(
            select(Score)
            .options(selectinload(Score.student))
            .where(Score.id == score_id)
        )
        return result.scalar_one_or_none()

    async def get_scores_by_exam_session(self, exam_session_id: str) -> List[Score]:
        result = await self.db.execute(
            select(Score)
            .options(selectinload(Score.student))
            .where(Score.exam_session_id == exam_session_id)
        )
        return result.scalars().all()

    async def get_scores_by_student(self, student_id: str) -> List[Score]:
        result = await self.db.execute(
            select(Score)
            .options(selectinload(Score.exam_session))
            .where(Score.student_id == student_id)
            .order_by(desc(Score.exam_session_id))
        )
        return result.scalars().all()

    async def update_score_ranks(self, exam_session_id: str) -> None:
        scores = await self.get_scores_by_exam_session(exam_session_id)
        sorted_by_score = sorted(scores, key=lambda s: s.total_score, reverse=True)

        for idx, score in enumerate(sorted_by_score):
            score.class_rank = idx + 1

        await self.db.commit()

    async def create_generated_comment(self, comment: GeneratedComment) -> GeneratedComment:
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def get_generated_comment(self, comment_id: str) -> Optional[GeneratedComment]:
        result = await self.db.execute(
            select(GeneratedComment).where(GeneratedComment.id == comment_id)
        )
        return result.scalar_one_or_none()

    async def list_generated_comments(
        self,
        exam_session_id: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[GeneratedComment], int]:
        query = select(GeneratedComment)
        count_query = select(func.count(GeneratedComment.id))

        if exam_session_id:
            query = query.where(GeneratedComment.exam_session_id == exam_session_id)
            count_query = count_query.where(GeneratedComment.exam_session_id == exam_session_id)
        if status:
            query = query.where(GeneratedComment.status == status)
            count_query = count_query.where(GeneratedComment.status == status)

        query = query.order_by(desc(GeneratedComment.created_at))
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(query)
        count_result = await self.db.execute(count_query)

        return result.scalars().all(), count_result.scalar()

    async def update_generated_comment(
        self, comment_id: str, **kwargs
    ) -> Optional[GeneratedComment]:
        comment = await self.get_generated_comment(comment_id)
        if not comment:
            return None

        for key, value in kwargs.items():
            if hasattr(comment, key):
                setattr(comment, key, value)

        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def create_comment_feedback(self, feedback: CommentFeedback) -> CommentFeedback:
        self.db.add(feedback)
        await self.db.commit()
        await self.db.refresh(feedback)
        return feedback

    async def list_comment_feedbacks(
        self,
        generated_comment_id: Optional[str] = None,
        action: Optional[str] = None,
        rating: Optional[int] = None,
    ) -> List[CommentFeedback]:
        query = select(CommentFeedback)

        if generated_comment_id:
            query = query.where(CommentFeedback.generated_comment_id == generated_comment_id)
        if action:
            query = query.where(CommentFeedback.action == action)
        if rating is not None:
            query = query.where(CommentFeedback.rating >= rating)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def create_regression_alert(self, alert: RegressionAlert) -> RegressionAlert:
        self.db.add(alert)
        await self.db.commit()
        await self.db.refresh(alert)
        return alert

    async def get_regression_alerts(
        self,
        exam_session_id: Optional[str] = None,
        student_id: Optional[str] = None,
        notified: Optional[bool] = None,
    ) -> List[RegressionAlert]:
        query = select(RegressionAlert)

        if exam_session_id:
            query = query.where(RegressionAlert.exam_session_id == exam_session_id)
        if student_id:
            query = query.where(RegressionAlert.student_id == student_id)
        if notified is not None:
            query = query.where(RegressionAlert.notified == notified)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def mark_alerts_notified(self, alert_ids: List[str]) -> None:
        await self.db.execute(
            RegressionAlert.__table__.update()
            .where(RegressionAlert.id.in_(alert_ids))
            .values(notified=True)
        )
        await self.db.commit()
