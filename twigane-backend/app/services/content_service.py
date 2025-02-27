from app.models.content_models import LearningContent, Exercise
from app.core.database import Database
from fastapi import HTTPException
from datetime import datetime
from typing import List
from bson import ObjectId

class ContentService:
    def __init__(self):
        self.db = Database.get_db()

    async def create_content(self, content_data: dict, creator_id: str) -> LearningContent:
        content_data["created_by"] = creator_id
        content_data["created_at"] = datetime.utcnow()
        content_data["updated_at"] = datetime.utcnow()
        
        result = await self.db.learning_content.insert_one(content_data)
        content_data["id"] = str(result.inserted_id)
        return LearningContent(**content_data)

    async def get_content(self, content_id: str) -> LearningContent:
        content = await self.db.learning_content.find_one({"_id": ObjectId(content_id)})
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        content["id"] = str(content["_id"])
        return LearningContent(**content)

    async def update_content(self, content_id: str, update_data: dict) -> LearningContent:
        update_data["updated_at"] = datetime.utcnow()
        result = await self.db.learning_content.update_one(
            {"_id": ObjectId(content_id)},
            {"$set": update_data}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Content not found")
        return await self.get_content(content_id)

    async def list_content(self, filters: dict = None) -> List[LearningContent]:
        query = filters or {}
        cursor = self.db.learning_content.find(query)
        contents = []
        async for content in cursor:
            content["id"] = str(content["_id"])
            contents.append(LearningContent(**content))
        return contents

    async def create_exercise(self, exercise_data: dict) -> Exercise:
        result = await self.db.exercises.insert_one(exercise_data)
        exercise_data["id"] = str(result.inserted_id)
        return Exercise(**exercise_data)

    async def get_content_exercises(self, content_id: str) -> List[Exercise]:
        cursor = self.db.exercises.find({"content_id": content_id})
        exercises = []
        async for exercise in cursor:
            exercise["id"] = str(exercise["_id"])
            exercises.append(Exercise(**exercise))
        return exercises