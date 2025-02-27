from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class UserAnalytics(BaseModel):
    user_id: str
    total_study_time: int  # in minutes
    completion_rate: float
    average_score: float
    engagement_level: str
    learning_pace: str
    emotional_states: Dict[str, int]
    last_updated: datetime

class LearningMetrics(BaseModel):
    content_id: str
    total_views: int
    average_completion_time: float
    difficulty_rating: float
    success_rate: float
    emotional_responses: Dict[str, int]
    accessibility_score: float

class ProgressReport(BaseModel):
    user_id: str
    period: str
    start_date: datetime
    end_date: datetime
    metrics: Dict[str, float]
    improvements: List[str]
    challenges: List[str]
    recommendations: List[str]