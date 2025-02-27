from app.models.notification_models import Notification, WebSocketMessage
from app.core.database import Database
from fastapi import WebSocket
from datetime import datetime, timedelta
from typing import Dict, List, Set
import json
import asyncio

class NotificationService:
    def __init__(self):
        self.db = Database.get_db()
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.background_tasks = set()

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

    async def disconnect(self, websocket: WebSocket, user_id: str):
        self.active_connections[user_id].remove(websocket)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]

    async def create_notification(self, notification_data: dict) -> Notification:
        notification = Notification(
            **notification_data,
            created_at=datetime.utcnow()
        )
        await self.db.notifications.insert_one(notification.dict())
        
        # Send real-time notification if user is connected
        if notification.user_id in self.active_connections:
            await self.broadcast_to_user(
                notification.user_id,
                WebSocketMessage(
                    type="notification",
                    data=notification.dict()
                )
            )
        
        return notification

    async def get_user_notifications(
        self, user_id: str, unread_only: bool = False
    ) -> List[Notification]:
        query = {"user_id": user_id}
        if unread_only:
            query["read"] = False
        
        notifications = await self.db.notifications.find(query).sort(
            "created_at", -1
        ).to_list(length=50)
        
        return [Notification(**n) for n in notifications]

    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        result = await self.db.notifications.update_one(
            {"_id": notification_id, "user_id": user_id},
            {"$set": {"read": True}}
        )
        return result.modified_count > 0

    async def broadcast_to_user(self, user_id: str, message: WebSocketMessage):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message.dict())
                except:
                    await self.disconnect(connection, user_id)

    async def start_background_tasks(self):
        task = asyncio.create_task(self._cleanup_expired_notifications())
        self.background_tasks.add(task)
        task.add_done_callback(self.background_tasks.discard)

    async def _cleanup_expired_notifications(self):
        while True:
            await self.db.notifications.delete_many({
                "expires_at": {"$lt": datetime.utcnow()}
            })
            await asyncio.sleep(3600)  # Run every hour