from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserRole(BaseModel):
    name: str
    permissions: List[str]

class UserProfile(BaseModel):
    user_id: str
    role: str = "student"
    disability_profile: Optional[dict] = None
    learning_preferences: Optional[dict] = {
        "content_type": "visual",
        "difficulty_level": "medium",
        "pace": "normal"
    }
    achievements: List[str] = []
    last_updated: datetime