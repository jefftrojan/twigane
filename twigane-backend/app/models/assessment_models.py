from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Assessment(BaseModel):
    title_rw: str
    title_en: Optional[str]
    description_rw: str
    description_en: Optional[str]
    content_id: str
    questions: List[dict]
    time_limit: int  # in minutes
    passing_score: int
    difficulty_level: str
    created_at: datetime
    updated_at: datetime

class AssessmentResult(BaseModel):
    user_id: str
    assessment_id: str
    score: float
    time_taken: int  # in seconds
    answers: List[dict]
    completed_at: datetime
    feedback_rw: Optional[str]
    feedback_en: Optional[str]
    mastery_level: str