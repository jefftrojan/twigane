from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class UserProgress(BaseModel):
    user_id: str
    lessons_completed: List[str] = []
    current_lesson: str = ""
    emotion_analysis_count: int = 0
    essays_submitted: int = 0
    chat_interactions: int = 0
    last_active: datetime = Field(default_factory=datetime.utcnow)

class UserSession(BaseModel):
    user_id: str
    chat_history: List[dict] = []
    emotion_context: dict = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)