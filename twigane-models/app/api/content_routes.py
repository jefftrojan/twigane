from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from app.services.content_service import ContentService
from app.middleware.auth import AuthMiddleware
from app.services.profile_service import ProfileService
from typing import List, Optional

content_router = APIRouter()
content_service = ContentService()
profile_service = ProfileService()
auth = AuthMiddleware()

@content_router.post("/create")
async def create_content(content_data: dict, current_user: dict = Depends(auth)):
    if not profile_service.check_permission(current_user["role"], "create_content"):
        raise HTTPException(status_code=403, detail="Permission denied")
    return await content_service.create_content(content_data, current_user["sub"])

@content_router.get("/list")
async def list_content(
    subject: Optional[str] = None,
    difficulty: Optional[str] = None,
    grade: Optional[str] = None,
    current_user: dict = Depends(auth)
):
    filters = {}
    if subject:
        filters["subject"] = subject
    if difficulty:
        filters["difficulty_level"] = difficulty
    if grade:
        filters["grade_level"] = grade
    return await content_service.list_content(filters)

@content_router.get("/{content_id}")
async def get_content(content_id: str, current_user: dict = Depends(auth)):
    return await content_service.get_content(content_id)

@content_router.put("/{content_id}")
async def update_content(
    content_id: str,
    update_data: dict,
    current_user: dict = Depends(auth)
):
    if not profile_service.check_permission(current_user["role"], "edit_content"):
        raise HTTPException(status_code=403, detail="Permission denied")
    return await content_service.update_content(content_id, update_data)

@content_router.post("/{content_id}/exercises")
async def add_exercise(
    content_id: str,
    exercise_data: dict,
    current_user: dict = Depends(auth)
):
    if not profile_service.check_permission(current_user["role"], "create_exercise"):
        raise HTTPException(status_code=403, detail="Permission denied")
    exercise_data["content_id"] = content_id
    return await content_service.create_exercise(exercise_data)