from app.models.mobile_models import MobileConfig, MobileSession
from app.core.database import Database
from fastapi import HTTPException
from datetime import datetime
import json

class MobileService:
    def __init__(self):
        self.db = Database.get_db()
        self.config = self._load_mobile_config()

    def _load_mobile_config(self) -> MobileConfig:
        return MobileConfig(
            version="1.0.0",
            min_supported_version="1.0.0",
            force_update=False,
            features={
                "offline_mode": True,
                "push_notifications": True,
                "biometric_auth": True,
                "voice_input": True
            },
            api_version="v1",
            cache_ttl=3600
        )

    async def register_device(self, user_id: str, device_info: dict) -> MobileSession:
        session = MobileSession(
            user_id=user_id,
            device_id=device_info.get("device_id"),
            device_info=device_info,
            last_sync=datetime.utcnow(),
            offline_data={}
        )
        
        await self.db.mobile_sessions.update_one(
            {"device_id": device_info.get("device_id")},
            {"$set": session.dict()},
            upsert=True
        )
        
        return session

    async def update_push_token(
        self, device_id: str, push_token: str
    ) -> MobileSession:
        result = await self.db.mobile_sessions.update_one(
            {"device_id": device_id},
            {"$set": {"push_token": push_token}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Device not found")
            
        return await self.get_session(device_id)

    async def get_session(self, device_id: str) -> MobileSession:
        session = await self.db.mobile_sessions.find_one({"device_id": device_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return MobileSession(**session)

    async def sync_offline_data(
        self, device_id: str, offline_data: dict
    ) -> MobileSession:
        session = await self.get_session(device_id)
        
        # Merge offline data with server data
        merged_data = self._merge_offline_data(
            session.offline_data,
            offline_data
        )
        
        # Update session with merged data
        await self.db.mobile_sessions.update_one(
            {"device_id": device_id},
            {
                "$set": {
                    "offline_data": merged_data,
                    "last_sync": datetime.utcnow()
                }
            }
        )
        
        return await self.get_session(device_id)

    def _merge_offline_data(self, server_data: dict, client_data: dict) -> dict:
        merged = server_data.copy()
        
        for key, value in client_data.items():
            if key not in merged:
                merged[key] = value
            elif isinstance(value, list):
                merged[key] = list(set(merged[key] + value))
            elif isinstance(value, dict):
                merged[key] = self._merge_offline_data(merged[key], value)
                
        return merged