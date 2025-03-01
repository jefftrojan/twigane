from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from app.services.notification_service import NotificationService
from app.middleware.auth import AuthMiddleware
from typing import List

notification_router = APIRouter()
notification_service = NotificationService()
auth = AuthMiddleware()

@notification_router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await notification_service.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Handle incoming WebSocket messages
            await notification_service.broadcast_to_user(user_id, data)
    except WebSocketDisconnect:
        await notification_service.disconnect(websocket, user_id)

@notification_router.get("/list")
async def get_notifications(
    unread_only: bool = False,
    current_user: dict = Depends(auth)
):
    return await notification_service.get_user_notifications(
        current_user["sub"],
        unread_only
    )

@notification_router.post("/mark-read/{notification_id}")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(auth)
):
    return await notification_service.mark_as_read(notification_id, current_user["sub"])