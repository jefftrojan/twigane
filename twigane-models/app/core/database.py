from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client = None
    db = None

    @classmethod
    async def connect_db(cls):
        try:
            if not settings.MONGODB_URL:
                raise ValueError("MongoDB connection URL not found in environment variables")
                
            cls.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000
            )
            cls.db = cls.client[settings.DATABASE_NAME]
            # Test connection
            await cls.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB Atlas")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    @classmethod
    async def get_db(cls):
        if cls.db is None:
            await cls.connect_db()
        return cls.db

    @classmethod
    async def close_db(cls):
        if cls.client is not None:
            cls.client.close()
            cls.client = None
            cls.db = None