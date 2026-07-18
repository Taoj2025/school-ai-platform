from .session import Base

from ..modules.accounts.models import User, Role, UserRole, Permission, RolePermission
from ..modules.files.models import File
from ..modules.ocr.models import OcrJob
from ..modules.ai.models import AiJob
from ..modules.audit.models import AuditLog
from ..modules.approvals.models import Approval
from ..modules.announcements.models import Announcement, AnnouncementTemplate, SendLog
from ..modules.apple.awards.models import AppleAward, AppleAwardRecipient
from ..modules.apple.finance.models import AppleFinanceRecord, AppleQuotation
from ..modules.apple.assets.models import AppleAsset, AppleAssetMovement
from ..modules.apple.students.models import AppleStudent, AppleAttendance, AppleCertificateRequest
from ..modules.grade.models import ExamSession, Score, GeneratedComment, CommentFeedback, RegressionAlert

__all__ = [
    "Base",
    "User", "Role", "UserRole", "Permission", "RolePermission",
    "File", "OcrJob", "AiJob", "AuditLog", "Approval",
    "Announcement", "AnnouncementTemplate", "SendLog",
    "AppleAward", "AppleAwardRecipient",
    "AppleFinanceRecord", "AppleQuotation",
    "AppleAsset", "AppleAssetMovement",
    "AppleStudent", "AppleAttendance", "AppleCertificateRequest",
    "ExamSession", "Score", "GeneratedComment", "CommentFeedback", "RegressionAlert",
]
