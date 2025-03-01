from app.core.database import Database
from datetime import datetime
from fastapi import HTTPException

class AdaptiveService:
    def __init__(self):
        self.db = Database.get_db()

    async def get_learning_path(self, user_id: str):
        """Get personalized learning path for user"""
        user = await self.db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {
            "current_level": user.get("level", "beginner"),
            "recommended_topics": await self._get_recommended_topics(user),
            "next_lessons": await self._get_next_lessons(user)
        }

    async def update_progress(self, user_id: str, lesson_id: str, performance: dict):
        """Update user's progress and adapt learning path"""
        result = await self.db.progress.update_one(
            {"user_id": user_id},
            {
                "$push": {
                    "completed_lessons": {
                        "lesson_id": lesson_id,
                        "performance": performance,
                        "completed_at": datetime.utcnow()
                    }
                }
            },
            upsert=True
        )
        
        await self._adjust_difficulty(user_id, performance)
        return {"status": "success", "updated": result.modified_count > 0}

    async def _get_recommended_topics(self, user: dict):
        """Get personalized topic recommendations"""
        level = user.get("level", "beginner")
        progress = await self.db.progress.find_one({"user_id": str(user["_id"])})
        
        completed_topics = set()
        if progress and "completed_lessons" in progress:
            completed_topics = {
                lesson["lesson_id"] 
                for lesson in progress["completed_lessons"]
            }
        
        pipeline = [
            {"$match": {"level": level}},
            {"$match": {"_id": {"$nin": list(completed_topics)}}},
            {"$limit": 5}
        ]
        
        cursor = self.db.topics.aggregate(pipeline)
        return await cursor.to_list(length=5)

    async def _get_next_lessons(self, user: dict):
        """Get next lessons based on user's progress"""
        level = user.get("level", "beginner")
        progress = await self.db.progress.find_one({"user_id": str(user["_id"])})
        
        completed_lessons = set()
        if progress and "completed_lessons" in progress:
            completed_lessons = {
                lesson["lesson_id"] 
                for lesson in progress["completed_lessons"]
            }
        
        pipeline = [
            {"$match": {"level": level}},
            {"$match": {"_id": {"$nin": list(completed_lessons)}}},
            {"$sort": {"sequence": 1}},
            {"$limit": 3}
        ]
        
        cursor = self.db.lessons.aggregate(pipeline)
        return await cursor.to_list(length=3)

    async def _adjust_difficulty(self, user_id: str, performance: dict):
        """Adjust difficulty based on user performance"""
        avg_score = sum(performance.values()) / len(performance)
        
        if avg_score >= 0.8:
            new_level = "advanced"
        elif avg_score >= 0.6:
            new_level = "intermediate"
        else:
            new_level = "beginner"
            
        await self.db.users.update_one(
            {"_id": user_id},
            {"$set": {"level": new_level}}
        )