from fastapi import APIRouter, Depends
from app.services.auth_service import AuthService
from app.models.auth_models import UserCreate, UserLogin, UserResponse, Token

auth_router = APIRouter()
auth_service = AuthService()

@auth_router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    return await auth_service.register_user(user_data)

@auth_router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    return await auth_service.authenticate_user(user_data)