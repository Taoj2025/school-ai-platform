from pydantic import BaseModel
from datetime import datetime


class AuditLogResponse(BaseModel):
    id: str
    user_id: str | None = None
    module: str | None = None
    action: str
    resource_type: str | None = None
    resource_id: str | None = None
    details: dict | None = None
    ip_address: str | None = None
    note: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
