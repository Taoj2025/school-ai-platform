import logging
from datetime import datetime, timezone, date
from decimal import Decimal
from typing import Any, Optional
from sqlalchemy import event
from sqlalchemy.orm import Session
from sqlalchemy.engine import Engine

from ..modules.audit.models import AuditLog
from ..modules.apple.finance.models import AppleFinanceRecord, AppleQuotation
from ..modules.apple.assets.models import AppleAsset, AppleAssetMovement
from ..modules.apple.awards.models import AppleAward, AppleAwardRecipient

logger = logging.getLogger(__name__)

_audit_user_context = threading.local() if 'threading' in dir() else None

try:
    import threading
    _audit_user_context = threading.local()
except ImportError:
    pass


def set_audit_user(user_id: Optional[str], username: Optional[str] = None):
    if _audit_user_context is not None:
        _audit_user_context.user_id = user_id
        _audit_user_context.username = username


def get_audit_user() -> tuple[Optional[str], Optional[str]]:
    if _audit_user_context is None:
        return None, None
    return getattr(_audit_user_context, 'user_id', None), getattr(_audit_user_context, 'username', None)


AUDITED_CLASSES = (
    AppleFinanceRecord,
    AppleQuotation,
    AppleAsset,
    AppleAssetMovement,
    AppleAward,
    AppleAwardRecipient,
)


def setup_audit_listeners():
    """
    Setup SQLAlchemy event listeners for automatic audit logging.
    Captures CREATE, UPDATE, DELETE operations on sensitive tables.
    """
    
    @event.listens_for(Session, "after_flush")
    def receive_after_flush(session: Session, flush_context):
        for obj in session.new:
            if isinstance(obj, AUDITED_CLASSES):
                user_id, username = get_audit_user()
                _create_audit_log(
                    session=session,
                    action="CREATE",
                    resource_type=obj.__class__.__name__,
                    resource_id=getattr(obj, 'id', None),
                    after_data=_obj_to_dict(obj),
                    user_id=user_id,
                    username=username,
                )
        
        for obj in session.dirty:
            if isinstance(obj, AUDITED_CLASSES):
                user_id, username = get_audit_user()
                _create_audit_log(
                    session=session,
                    action="UPDATE",
                    resource_type=obj.__class__.__name__,
                    resource_id=getattr(obj, 'id', None),
                    before_data=_get_committed_state(session, obj),
                    after_data=_obj_to_dict(obj),
                    user_id=user_id,
                    username=username,
                )
        
        for obj in session.deleted:
            if isinstance(obj, AUDITED_CLASSES):
                user_id, username = get_audit_user()
                _create_audit_log(
                    session=session,
                    action="DELETE",
                    resource_type=obj.__class__.__name__,
                    resource_id=getattr(obj, 'id', None),
                    before_data=_obj_to_dict(obj),
                    user_id=user_id,
                    username=username,
                )


def _create_audit_log(
    session: Session,
    action: str,
    resource_type: str,
    resource_id: Any,
    before_data: Optional[dict] = None,
    after_data: Optional[dict] = None,
    user_id: Optional[str] = None,
    username: Optional[str] = None,
):
    try:
        audit_log = AuditLog(
            user_id=user_id,
            username=username,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            details={
                "before": before_data,
                "after": after_data,
            },
        )
        session.add(audit_log)
        logger.debug(f"Audit log created: {action} {resource_type} {resource_id}")
    except Exception as e:
        logger.error(f"Failed to create audit log: {str(e)}")


def _obj_to_dict(obj) -> Optional[dict]:
    if obj is None:
        return None
    try:
        result = {}
        for column in obj.__table__.columns:
            value = getattr(obj, column.name, None)
            if isinstance(value, datetime):
                value = value.isoformat()
            elif isinstance(value, date):
                value = value.isoformat()
            elif isinstance(value, Decimal):
                value = float(value)
            elif isinstance(value, (bytes, bytearray)):
                value = value.decode("utf-8", errors="replace")
            result[column.name] = value
        return result
    except Exception:
        return None


def _get_committed_state(session: Session, obj) -> Optional[dict]:
    try:
        for state in session.identity_map.values() if hasattr(session, 'identity_map') else []:
            if state.obj() is obj:
                return _obj_to_dict(state.obj())
    except Exception:
        pass
    return None


class AuditContext:
    """Context manager for setting audit user."""
    
    def __init__(self, user_id: str, username: str):
        self.user_id = user_id
        self.username = username
        self.previous_user_id = None
        self.previous_username = None
    
    def __enter__(self):
        self.previous_user_id, self.previous_username = get_audit_user()
        set_audit_user(self.user_id, self.username)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        set_audit_user(self.previous_user_id, self.previous_username)
        return False