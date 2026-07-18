import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer, Date, ForeignKey, Boolean, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from ...db.session import Base
from ..apple.students.models import AppleStudent
from ..files.models import File  # noqa: F401  (ensures 'files' table is registered in metadata)


class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    exam_date = Column(Date, nullable=False, index=True)
    semester = Column(String(20), nullable=False, index=True)
    academic_year = Column(String(20), nullable=False, index=True)

    subject = Column(String(100), nullable=False, index=True)
    grade = Column(String(50), nullable=False, index=True)
    class_ids = Column(ARRAY(Integer), nullable=True)

    total_score = Column(Integer, nullable=False)
    answer_key = Column(JSON, nullable=False)

    status = Column(String(50), default="draft")
    created_by = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    scores = relationship("Score", back_populates="exam_session", cascade="all, delete-orphan")
    generated_comments = relationship("GeneratedComment", back_populates="exam_session", cascade="all, delete-orphan")


class Score(Base):
    __tablename__ = "scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exam_session_id = Column(String(36), ForeignKey("exam_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("apple_students.id", ondelete="CASCADE"), nullable=False, index=True)

    scores_by_question = Column(JSON, nullable=False)
    total_score = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)

    class_rank = Column(Integer, nullable=True)
    grade_rank = Column(Integer, nullable=True)

    input_method = Column(String(20), default="manual")
    file_id = Column(String(36), ForeignKey("files.id"), nullable=True)
    manually_verified = Column(Boolean, default=False)
    teacher_id = Column(String(36), nullable=True)

    ocr_confidence = Column(Float, nullable=True)
    ocr_engine = Column(String(20), nullable=True)
    anomalies = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    exam_session = relationship("ExamSession", back_populates="scores")
    student = relationship("AppleStudent")
    generated_comments = relationship("GeneratedComment", back_populates="score", cascade="all, delete-orphan")


class GeneratedComment(Base):
    __tablename__ = "generated_comments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exam_session_id = Column(String(36), ForeignKey("exam_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    score_id = Column(String(36), ForeignKey("scores.id", ondelete="CASCADE"), nullable=False, index=True)

    content = Column(Text, nullable=False)
    level = Column(String(20), nullable=False)
    model = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=True)

    status = Column(String(20), default="pending_review")
    teacher_id = Column(String(36), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    exam_session = relationship("ExamSession", back_populates="generated_comments")
    score = relationship("Score", back_populates="generated_comments")
    feedbacks = relationship("CommentFeedback", back_populates="generated_comment", cascade="all, delete-orphan")


class CommentFeedback(Base):
    __tablename__ = "comment_feedbacks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    generated_comment_id = Column(String(36), ForeignKey("generated_comments.id", ondelete="CASCADE"), nullable=False, index=True)

    action = Column(String(20), nullable=False)
    final_content = Column(Text, nullable=True)
    edit_diff = Column(JSON, nullable=True)
    time_spent_seconds = Column(Integer, nullable=True)

    rating = Column(Integer, nullable=True)
    feedback_text = Column(Text, nullable=True)

    teacher_id = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    generated_comment = relationship("GeneratedComment", back_populates="feedbacks")


class RegressionAlert(Base):
    __tablename__ = "regression_alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("apple_students.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_session_id = Column(String(36), ForeignKey("exam_sessions.id", ondelete="CASCADE"), nullable=False, index=True)

    type = Column(String(20), nullable=False)
    severity = Column(String(20), nullable=False)
    from_avg = Column(Float, nullable=False)
    to_avg = Column(Float, nullable=False)
    change = Column(Float, nullable=False)

    message = Column(Text, nullable=False)
    notified = Column(Boolean, default=False)
    notified_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    student = relationship("AppleStudent")
    exam_session = relationship("ExamSession")
