from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None

    @classmethod
    async def connect_db(cls):
        cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
        cls.db = cls.client[settings.DATABASE_NAME]

    @classmethod
    async def close_db(cls):
        if cls.client:
            cls.client.close()

    @classmethod
    def get_db(cls):
        return cls.db