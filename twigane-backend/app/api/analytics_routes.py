from fastapi import APIRouter, Depends, HTTPException
from app.services.analytics_service import AnalyticsService
from app.middleware.auth import AuthMiddleware
from app.services.profile_service import ProfileService

analytics_router = APIRouter()
analytics_service = AnalyticsService()
profile_service = ProfileService()
auth = AuthMiddleware()

@analytics_router.get("/user/{user_id}")
async def get_user_analytics(
    user_id: str,
    current_user: dict = Depends(auth)
):
    if not profile_service.check_permission(current_user["role"], "view_analytics"):
        raise HTTPException(status_code=403, detail="Permission denied")
    return await analytics_service.generate_user_analytics(user_id)

@analytics_router.get("/content/{content_id}")
async def get_content_metrics(
    content_id: str,
    current_user: dict = Depends(auth)
):
    if not profile_service.check_permission(current_user["role"], "view_analytics"):
        raise HTTPException(status_code=403, detail="Permission denied")
    return await analytics_service.generate_content_metrics(content_id)

@analytics_router.get("/progress/{user_id}")
async def get_progress_report(
    user_id: str,
    period: str = "weekly",
    current_user: dict = Depends(auth)
):
    if not profile_service.check_permission(current_user["role"], "view_analytics"):
        raise HTTPException(status_code=403, detail="Permission denied")
    return await analytics_service.generate_progress_report(user_id, period)