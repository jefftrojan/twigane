from app.models.analytics_models import UserAnalytics, LearningMetrics, ProgressReport
from app.core.database import Database
from fastapi import HTTPException
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from typing import List, Dict

class AnalyticsService:
    def __init__(self):
        self.db = Database.get_db()

    async def generate_user_analytics(self, user_id: str) -> UserAnalytics:
        # Gather user activity data
        sessions = await self._get_user_sessions(user_id)
        assessments = await self._get_user_assessments(user_id)
        emotions = await self._get_emotional_data(user_id)
        
        analytics = {
            "user_id": user_id,
            "total_study_time": self._calculate_total_study_time(sessions),
            "completion_rate": self._calculate_completion_rate(sessions),
            "average_score": self._calculate_average_score(assessments),
            "engagement_level": self._determine_engagement_level(sessions),
            "learning_pace": self._determine_learning_pace(sessions, assessments),
            "emotional_states": self._analyze_emotional_states(emotions),
            "last_updated": datetime.utcnow()
        }
        
        await self.db.user_analytics.update_one(
            {"user_id": user_id},
            {"$set": analytics},
            upsert=True
        )
        
        return UserAnalytics(**analytics)

    async def generate_content_metrics(self, content_id: str) -> LearningMetrics:
        interactions = await self._get_content_interactions(content_id)
        
        metrics = {
            "content_id": content_id,
            "total_views": len(interactions),
            "average_completion_time": self._calculate_avg_completion_time(interactions),
            "difficulty_rating": self._calculate_difficulty_rating(interactions),
            "success_rate": self._calculate_success_rate(interactions),
            "emotional_responses": self._analyze_emotional_responses(interactions),
            "accessibility_score": self._calculate_accessibility_score(interactions)
        }
        
        await self.db.content_metrics.update_one(
            {"content_id": content_id},
            {"$set": metrics},
            upsert=True
        )
        
        return LearningMetrics(**metrics)

    async def generate_progress_report(
        self, user_id: str, period: str = "weekly"
    ) -> ProgressReport:
        start_date = self._get_period_start_date(period)
        
        # Gather data for the period
        activities = await self._get_period_activities(user_id, start_date)
        
        report = {
            "user_id": user_id,
            "period": period,
            "start_date": start_date,
            "end_date": datetime.utcnow(),
            "metrics": self._calculate_period_metrics(activities),
            "improvements": self._identify_improvements(activities),
            "challenges": self._identify_challenges(activities),
            "recommendations": await self._generate_recommendations(activities)
        }
        
        return ProgressReport(**report)

    def _get_period_start_date(self, period: str) -> datetime:
        now = datetime.utcnow()
        if period == "weekly":
            return now - timedelta(days=7)
        elif period == "monthly":
            return now - timedelta(days=30)
        elif period == "quarterly":
            return now - timedelta(days=90)
        return now - timedelta(days=7)  # Default to weekly

    async def _get_user_sessions(self, user_id: str) -> List[dict]:
        return await self.db.user_sessions.find(
            {"user_id": user_id}
        ).sort("created_at", -1).to_list(length=100)

    async def _get_emotional_data(self, user_id: str) -> List[dict]:
        return await self.db.emotion_analyses.find(
            {"user_id": user_id}
        ).sort("created_at", -1).to_list(length=100)