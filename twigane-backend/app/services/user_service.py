from datetime import datetime
from fastapi import HTTPException
from app.core.database import Database
from app.models.db_models import UserProgress, UserSession
from bson import ObjectId

class UserService:
    def __init__(self):
        self.db = Database.get_db()

    async def create_user_progress(self, user_id: str) -> UserProgress:
        user_progress = UserProgress(user_id=user_id)
        await self.db.user_progress.insert_one(user_progress.dict())
        return user_progress

    async def update_progress(self, user_id: str, update_data: dict) -> UserProgress:
        update_data["last_active"] = datetime.utcnow()
        result = await self.db.user_progress.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User progress not found")
        return await self.get_progress(user_id)

    async def get_progress(self, user_id: str) -> UserProgress:
        progress = await self.db.user_progress.find_one({"user_id": user_id})
        if not progress:
            raise HTTPException(status_code=404, detail="User progress not found")
        return UserProgress(**progress)

    async def create_session(self, user_id: str) -> UserSession:
        session = UserSession(user_id=user_id)
        await self.db.user_sessions.insert_one(session.dict())
        return session

    async def update_session(self, user_id: str, chat_history: list, emotion_context: dict) -> UserSession:
        update_data = {
            "chat_history": chat_history,
            "emotion_context": emotion_context,
            "updated_at": datetime.utcnow()
        }
        result = await self.db.user_sessions.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User session not found")
        return await self.get_session(user_id)

    async def get_session(self, user_id: str) -> UserSession:
        session = await self.db.user_sessions.find_one({"user_id": user_id})
        if not session:
            raise HTTPException(status_code=404, detail="User session not found")
        return UserSession(**session)