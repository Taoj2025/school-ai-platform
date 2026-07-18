"""add grade and announcements modules tables

Revision ID: 002_grade_announcements
Revises: 001_initial
Create Date: 2026-07-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '002_grade_announcements'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE TABLE IF NOT EXISTS exam_sessions ('
               'id VARCHAR(36) NOT NULL, '
               'name VARCHAR(200) NOT NULL, '
               'exam_date DATE NOT NULL, '
               'semester VARCHAR(20) NOT NULL, '
               'academic_year VARCHAR(20) NOT NULL, '
               'subject VARCHAR(100) NOT NULL, '
               'grade VARCHAR(50) NOT NULL, '
               'class_ids INTEGER[], '
               'total_score INTEGER NOT NULL, '
               'answer_key JSON NOT NULL, '
               'status VARCHAR(50), '
               'created_by VARCHAR(36), '
               'created_at TIMESTAMP WITH TIME ZONE, '
               'updated_at TIMESTAMP WITH TIME ZONE, '
               'PRIMARY KEY (id))')
    op.execute('CREATE INDEX IF NOT EXISTS ix_exam_sessions_semester ON exam_sessions (semester)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_exam_sessions_subject ON exam_sessions (subject)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_exam_sessions_grade ON exam_sessions (grade)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_exam_sessions_academic_year ON exam_sessions (academic_year)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_exam_sessions_exam_date ON exam_sessions (exam_date)')

    op.execute('CREATE TABLE IF NOT EXISTS scores ('
               'id VARCHAR(36) NOT NULL, '
               'exam_session_id VARCHAR(36) NOT NULL, '
               'student_id VARCHAR(36) NOT NULL, '
               'scores_by_question JSON NOT NULL, '
               'total_score INTEGER NOT NULL, '
               'percentage DOUBLE PRECISION NOT NULL, '
               'class_rank INTEGER, '
               'grade_rank INTEGER, '
               'input_method VARCHAR(20), '
               'file_id VARCHAR(36), '
               'manually_verified BOOLEAN, '
               'teacher_id VARCHAR(36), '
               'ocr_confidence DOUBLE PRECISION, '
               'ocr_engine VARCHAR(20), '
               'anomalies JSON, '
               'created_at TIMESTAMP WITH TIME ZONE, '
               'updated_at TIMESTAMP WITH TIME ZONE, '
               'PRIMARY KEY (id), '
               'FOREIGN KEY(exam_session_id) REFERENCES exam_sessions (id) ON DELETE CASCADE, '
               'FOREIGN KEY(student_id) REFERENCES apple_students (id) ON DELETE CASCADE, '
               'FOREIGN KEY(file_id) REFERENCES files (id))')
    op.execute('CREATE INDEX IF NOT EXISTS ix_scores_exam_session_id ON scores (exam_session_id)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_scores_student_id ON scores (student_id)')

    op.execute('CREATE TABLE IF NOT EXISTS generated_comments ('
               'id VARCHAR(36) NOT NULL, '
               'exam_session_id VARCHAR(36) NOT NULL, '
               'score_id VARCHAR(36) NOT NULL, '
               'content TEXT NOT NULL, '
               'level VARCHAR(20) NOT NULL, '
               'model VARCHAR(50) NOT NULL, '
               'confidence DOUBLE PRECISION, '
               'status VARCHAR(20), '
               'teacher_id VARCHAR(36), '
               'reviewed_at TIMESTAMP WITH TIME ZONE, '
               'created_at TIMESTAMP WITH TIME ZONE, '
               'PRIMARY KEY (id), '
               'FOREIGN KEY(exam_session_id) REFERENCES exam_sessions (id) ON DELETE CASCADE, '
               'FOREIGN KEY(score_id) REFERENCES scores (id) ON DELETE CASCADE)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_generated_comments_exam_session_id ON generated_comments (exam_session_id)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_generated_comments_score_id ON generated_comments (score_id)')

    op.execute('CREATE TABLE IF NOT EXISTS comment_feedbacks ('
               'id VARCHAR(36) NOT NULL, '
               'generated_comment_id VARCHAR(36) NOT NULL, '
               'action VARCHAR(20) NOT NULL, '
               'final_content TEXT, '
               'edit_diff JSON, '
               'time_spent_seconds INTEGER, '
               'rating INTEGER, '
               'feedback_text TEXT, '
               'teacher_id VARCHAR(36), '
               'created_at TIMESTAMP WITH TIME ZONE, '
               'PRIMARY KEY (id), '
               'FOREIGN KEY(generated_comment_id) REFERENCES generated_comments (id) ON DELETE CASCADE)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_comment_feedbacks_generated_comment_id ON comment_feedbacks (generated_comment_id)')

    op.execute('CREATE TABLE IF NOT EXISTS regression_alerts ('
               'id VARCHAR(36) NOT NULL, '
               'student_id VARCHAR(36) NOT NULL, '
               'exam_session_id VARCHAR(36) NOT NULL, '
               'type VARCHAR(20) NOT NULL, '
               'severity VARCHAR(20) NOT NULL, '
               'from_avg DOUBLE PRECISION NOT NULL, '
               'to_avg DOUBLE PRECISION NOT NULL, '
               'change DOUBLE PRECISION NOT NULL, '
               'message TEXT NOT NULL, '
               'notified BOOLEAN, '
               'notified_at TIMESTAMP WITH TIME ZONE, '
               'created_at TIMESTAMP WITH TIME ZONE, '
               'PRIMARY KEY (id), '
               'FOREIGN KEY(student_id) REFERENCES apple_students (id) ON DELETE CASCADE, '
               'FOREIGN KEY(exam_session_id) REFERENCES exam_sessions (id) ON DELETE CASCADE)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_regression_alerts_student_id ON regression_alerts (student_id)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_regression_alerts_exam_session_id ON regression_alerts (exam_session_id)')

    op.execute('CREATE TABLE IF NOT EXISTS announcements ('
               'id VARCHAR(36) NOT NULL, '
               'title_zh VARCHAR(500), '
               'title_en VARCHAR(500), '
               'body_zh TEXT, '
               'body_en TEXT, '
               'announcement_type VARCHAR(50) NOT NULL, '
               'target_audience VARCHAR(50) NOT NULL, '
               'academic_year VARCHAR(20), '
               'semester VARCHAR(20), '
               'key_dates JSON, '
               'key_location VARCHAR(500), '
               'subject VARCHAR(200), '
               'teachers JSON, '
               'special_notes TEXT, '
               'formality VARCHAR(20), '
               'status VARCHAR(50), '
               'template_id VARCHAR(36), '
               'ai_generated BOOLEAN, '
               'ai_confidence VARCHAR(20), '
               'ai_warnings JSON, '
               'created_by VARCHAR(36), '
               'approved_by VARCHAR(36), '
               'sent_at TIMESTAMP WITH TIME ZONE, '
               'created_at TIMESTAMP WITH TIME ZONE, '
               'updated_at TIMESTAMP WITH TIME ZONE, '
               'PRIMARY KEY (id))')
    op.execute('CREATE INDEX IF NOT EXISTS ix_announcements_announcement_type ON announcements (announcement_type)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_announcements_status ON announcements (status)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_announcements_academic_year ON announcements (academic_year)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_announcements_semester ON announcements (semester)')

    op.execute('CREATE TABLE IF NOT EXISTS announcement_templates ('
               'id VARCHAR(36) NOT NULL, '
               'name VARCHAR(200) NOT NULL, '
               'category VARCHAR(50) NOT NULL, '
               'title_zh_template VARCHAR(500), '
               'title_en_template VARCHAR(500), '
               'body_zh_template TEXT, '
               'body_en_template TEXT, '
               'required_params JSON, '
               'is_active BOOLEAN, '
               'usage_count INTEGER, '
               'avg_rating INTEGER, '
               'created_by VARCHAR(36), '
               'created_at TIMESTAMP WITH TIME ZONE, '
               'updated_at TIMESTAMP WITH TIME ZONE, '
               'PRIMARY KEY (id))')
    op.execute('CREATE INDEX IF NOT EXISTS ix_announcement_templates_category ON announcement_templates (category)')

    op.execute('CREATE TABLE IF NOT EXISTS send_logs ('
               'id VARCHAR(36) NOT NULL, '
               'announcement_id VARCHAR(36) NOT NULL, '
               'recipient_id VARCHAR(36), '
               'recipient_name VARCHAR(200), '
               'channel VARCHAR(20) NOT NULL, '
               'target_address VARCHAR(500), '
               'status VARCHAR(20), '
               'sent_at TIMESTAMP WITH TIME ZONE, '
               'delivered_at TIMESTAMP WITH TIME ZONE, '
               'read_at TIMESTAMP WITH TIME ZONE, '
               'error_message TEXT, '
               'retry_count INTEGER, '
               'PRIMARY KEY (id), '
               'FOREIGN KEY(announcement_id) REFERENCES announcements (id) ON DELETE CASCADE)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_send_logs_announcement_id ON send_logs (announcement_id)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_send_logs_status ON send_logs (status)')


def downgrade() -> None:
    op.execute('DROP TABLE IF EXISTS send_logs')
    op.execute('DROP TABLE IF EXISTS announcement_templates')
    op.execute('DROP TABLE IF EXISTS announcements')
    op.execute('DROP TABLE IF EXISTS regression_alerts')
    op.execute('DROP TABLE IF EXISTS comment_feedbacks')
    op.execute('DROP TABLE IF EXISTS generated_comments')
    op.execute('DROP TABLE IF EXISTS scores')
    op.execute('DROP TABLE IF EXISTS exam_sessions')
