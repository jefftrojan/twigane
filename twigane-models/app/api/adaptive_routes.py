from fastapi import APIRouter, Depends, HTTPException
from app.services.adaptive_service import AdaptiveService
from app.middleware.auth import AuthMiddleware
from typing import List

adaptive_router = APIRouter()
adaptive_service = AdaptiveService()
auth = AuthMiddleware()

@adaptive_router.post("/initialize")
async def initialize_learning_path(
    initial_assessment: dict,
    current_user: dict = Depends(auth)
):
    return await adaptive_service.initialize_learning_path(
        current_user["sub"],
        initial_assessment
    )

@adaptive_router.get("/recommendations")
async def get_recommendations(current_user: dict = Depends(auth)):
    return await adaptive_service.get_recommendations(current_user["sub"])

@adaptive_router.put("/update")
async def update_learning_path(
    performance_data: dict,
    current_user: dict = Depends(auth)
):
    return await adaptive_service.update_learning_path(
        current_user["sub"],
        performance_data
    )