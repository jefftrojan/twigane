from fastapi import APIRouter, Depends, HTTPException
from app.services.assessment_service import AssessmentService
from app.middleware.auth import AuthMiddleware
from app.services.profile_service import ProfileService
from typing import List

assessment_router = APIRouter()
assessment_service = AssessmentService()
profile_service = ProfileService()
auth = AuthMiddleware()

@assessment_router.post("/create")
async def create_assessment(
    assessment_data: dict,
    current_user: dict = Depends(auth)
):
    if not profile_service.check_permission(current_user["role"], "create_assessment"):
        raise HTTPException(status_code=403, detail="Permission denied")
    return await assessment_service.create_assessment(assessment_data)

@assessment_router.get("/{assessment_id}")
async def get_assessment(assessment_id: str, current_user: dict = Depends(auth)):
    return await assessment_service.get_assessment(assessment_id)

@assessment_router.post("/{assessment_id}/submit")
async def submit_assessment(
    assessment_id: str,
    submission: dict,
    current_user: dict = Depends(auth)
):
    return await assessment_service.submit_assessment(
        current_user["sub"],
        assessment_id,
        submission
    )