from passlib.context import CryptContext
from app.models.auth_models import UserCreate, UserLogin, UserResponse, Token
from app.core.database import Database
from app.middleware.auth import AuthMiddleware
from fastapi import HTTPException
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self):
        self.db = Database.get_db()
        self.auth_middleware = AuthMiddleware()

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    async def register_user(self, user_data: UserCreate) -> UserResponse:
        # Check if user exists
        if await self.db.users.find_one({"email": user_data.email}):
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hash password
        hashed_password = self.get_password_hash(user_data.password)
        user_dict = user_data.dict()
        user_dict["password"] = hashed_password
        user_dict["created_at"] = datetime.utcnow()

        # Insert user
        result = await self.db.users.insert_one(user_dict)
        user_dict["id"] = str(result.inserted_id)
        del user_dict["password"]
        
        return UserResponse(**user_dict)

    async def authenticate_user(self, user_data: UserLogin) -> Token:
        user = await self.db.users.find_one({"email": user_data.email})
        if not user or not self.verify_password(user_data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Incorrect email or password")

        # Create access token
        token_data = {
            "sub": str(user["_id"]),
            "email": user["email"],
            "username": user["username"]
        }
        access_token = self.auth_middleware.create_access_token(token_data)
        
        return Token(access_token=access_token)