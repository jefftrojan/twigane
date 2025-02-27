from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class LearningPath(BaseModel):
    user_id: str
    current_level: str
    learning_style: str
    preferred_content_types: List[str]
    pace: str
    strengths: List[str]
    areas_for_improvement: List[str]
    recommended_content: List[str]
    last_updated: datetime

class AdaptiveRecommendation(BaseModel):
    content_id: str
    confidence_score: float
    reason_rw: str
    reason_en: Optional[str]
    difficulty_adjustment: str
    recommended_format: str