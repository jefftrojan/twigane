from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    def connect_db(cls):
        cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
        cls.db = cls.client[settings.DATABASE_NAME]
        print(f"Connected to MongoDB: {settings.DATABASE_NAME}")

    @classmethod
    def get_db(cls):
        if cls.db is None:  # Changed from 'if not cls.db' to 'if cls.db is None'
            cls.connect_db()
        return cls.db

    @classmethod
    def close_db(cls):
        if cls.client:
            cls.client.close()
            cls.client = None
            cls.db = None