from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Notification(BaseModel):
    user_id: str
    title_rw: str
    title_en: Optional[str]
    message_rw: str
    message_en: Optional[str]
    type: str  # 'achievement', 'reminder', 'feedback', 'system'
    priority: str = "normal"
    read: bool = False
    action_url: Optional[str]
    created_at: datetime
    expires_at: Optional[datetime]

class WebSocketMessage(BaseModel):
    type: str
    data: dict
    timestamp: datetime = datetime.utcnow()