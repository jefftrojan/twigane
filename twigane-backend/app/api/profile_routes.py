from fastapi import APIRouter, Depends, HTTPException
from app.services.profile_service import ProfileService
from app.middleware.auth import AuthMiddleware
from app.models.profile_models import UserProfile

profile_router = APIRouter()
profile_service = ProfileService()
auth = AuthMiddleware()

@profile_router.post("/create", response_model=UserProfile)
async def create_profile(role: str, current_user: dict = Depends(auth)):
    return await profile_service.create_profile(current_user["sub"], role)

@profile_router.get("/me", response_model=UserProfile)
async def get_my_profile(current_user: dict = Depends(auth)):
    return await profile_service.get_profile(current_user["sub"])

@profile_router.put("/update", response_model=UserProfile)
async def update_profile(update_data: dict, current_user: dict = Depends(auth)):
    return await profile_service.update_profile(current_user["sub"], update_data)