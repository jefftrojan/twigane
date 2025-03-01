from app.models.user import UserCreate, UserLogin, UserInDB
from app.core.database import Database
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
from app.core.config import settings
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self):
        self.db = None
        self.users_collection = None

    async def init_db(self):
        try:
            if self.db is None:  # Changed from 'if not self.db'
                self.db = await Database.get_db()
                self.users_collection = self.db.users
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise HTTPException(status_code=500, detail="Database connection failed")

    async def register_user(self, user_data: UserCreate):
        try:
            await self.init_db()
            
            # Check if user exists
            existing_email = await self.users_collection.find_one({"email": user_data.email})
            if existing_email:
                raise HTTPException(status_code=400, detail="Email already registered")
                
            existing_username = await self.users_collection.find_one({"username": user_data.username})
            if existing_username:
                raise HTTPException(status_code=400, detail="Username already taken")

            # Create user document
            user_dict = user_data.dict()
            user_dict["hashed_password"] = self.get_password_hash(user_dict.pop("password"))
            user_dict["created_at"] = datetime.utcnow()
            user_dict["is_active"] = True
            
            # Insert into database
            result = await self.users_collection.insert_one(user_dict)
            
            # Create access token
            access_token = self.create_access_token({"sub": str(result.inserted_id)})
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user_id": str(result.inserted_id)
            }
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(f"Registration failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    async def login_user(self, user_data: UserLogin):
        try:
            await self.init_db()
            
            # Find user by email
            user = await self.users_collection.find_one({"email": user_data.email})
            if not user:
                raise HTTPException(status_code=400, detail="Email not registered")
                
            # Verify password
            if not self.verify_password(user_data.password, user["hashed_password"]):
                raise HTTPException(status_code=400, detail="Incorrect password")
                
            # Create access token
            access_token = self.create_access_token({"sub": str(user["_id"])})
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user_id": str(user["_id"])
            }
            
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(f"Login failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    def create_access_token(self, data: dict) -> str:
        try:
            to_encode = data.copy()
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            to_encode.update({"exp": expire})
            encoded_jwt = jwt.encode(
                to_encode, 
                settings.SECRET_KEY, 
                algorithm=settings.ALGORITHM
            )
            return encoded_jwt
        except Exception as e:
            logger.error(f"Token creation failed: {e}")
            raise HTTPException(status_code=500, detail="Could not create access token")