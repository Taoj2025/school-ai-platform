from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ApprovalResponse(BaseModel):
    id: str
    module: str
    resource_type: str
    resource_id: str
    status: str
    requested_by: str
    reviewed_by: Optional[str] = None
    review_comment: Optional[str] = None
    metadata: Optional[Any] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
