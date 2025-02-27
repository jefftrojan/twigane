from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class MobileConfig(BaseModel):
    version: str
    min_supported_version: str
    force_update: bool
    features: Dict[str, bool]
    api_version: str
    cache_ttl: int  # in seconds

class MobileSession(BaseModel):
    user_id: str
    device_id: str
    device_info: dict
    push_token: Optional[str]
    last_sync: datetime
    offline_data: dict