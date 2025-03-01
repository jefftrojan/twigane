from app.models.profile_models import UserProfile, UserRole
from app.core.database import Database
from fastapi import HTTPException
from datetime import datetime

class ProfileService:
    def __init__(self):
        self.db = Database.get_db()
        self.roles = {
            "student": UserRole(
                name="student",
                permissions=["read_lessons", "submit_essays", "use_chatbot"]
            ),
            "teacher": UserRole(
                name="teacher",
                permissions=["read_lessons", "create_lessons", "review_essays", "manage_students"]
            ),
            "admin": UserRole(
                name="admin",
                permissions=["all"]
            )
        }

    async def create_profile(self, user_id: str, role: str = "student") -> UserProfile:
        if role not in self.roles:
            raise HTTPException(status_code=400, detail="Invalid role")

        profile = UserProfile(
            user_id=user_id,
            role=role,
            last_updated=datetime.utcnow()
        )
        await self.db.profiles.insert_one(profile.dict())
        return profile

    async def update_profile(self, user_id: str, update_data: dict) -> UserProfile:
        update_data["last_updated"] = datetime.utcnow()
        result = await self.db.profiles.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Profile not found")
        return await self.get_profile(user_id)

    async def get_profile(self, user_id: str) -> UserProfile:
        profile = await self.db.profiles.find_one({"user_id": user_id})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return UserProfile(**profile)

    def check_permission(self, role: str, required_permission: str) -> bool:
        if role not in self.roles:
            return False
        return required_permission in self.roles[role].permissions or "all" in self.roles[role].permissions