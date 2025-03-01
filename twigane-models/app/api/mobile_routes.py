from fastapi import APIRouter, Depends, HTTPException
from app.services.mobile_service import MobileService
from app.middleware.auth import AuthMiddleware
from typing import Dict

mobile_router = APIRouter()
mobile_service = MobileService()
auth = AuthMiddleware()

@mobile_router.get("/config")
async def get_mobile_config():
    return mobile_service.config

@mobile_router.post("/register")
async def register_device(
    device_info: Dict,
    current_user: dict = Depends(auth)
):
    return await mobile_service.register_device(current_user["sub"], device_info)

@mobile_router.put("/push-token")
async def update_push_token(
    device_id: str,
    push_token: str,
    current_user: dict = Depends(auth)
):
    return await mobile_service.update_push_token(device_id, push_token)

@mobile_router.post("/sync")
async def sync_data(
    device_id: str,
    offline_data: Dict,
    current_user: dict = Depends(auth)
):
    return await mobile_service.sync_offline_data(device_id, offline_data)