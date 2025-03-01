from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class LearningContent(BaseModel):
    title_rw: str
    title_en: Optional[str]
    content_rw: str
    content_en: Optional[str]
    content_type: str  # 'lesson', 'exercise', 'assessment'
    subject: str
    difficulty_level: str
    grade_level: str
    tags: List[str] = []
    multimedia_urls: Optional[dict] = {}
    created_by: str
    created_at: datetime
    updated_at: datetime
    accessibility_features: dict = {
        "has_audio": False,
        "has_visual_aids": False,
        "has_simplified_version": False
    }

class Exercise(BaseModel):
    content_id: str
    question_rw: str
    question_en: Optional[str]
    options: List[dict]
    correct_answer: str
    explanation_rw: str
    explanation_en: Optional[str]
    difficulty_level: str