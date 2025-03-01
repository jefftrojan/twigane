from fastapi import APIRouter, HTTPException, Depends
from app.models.user import UserCreate, UserLogin
from app.services.auth_service import AuthService
from app.core.database import Database
import logging
import traceback

logger = logging.getLogger(__name__)

auth_router = APIRouter()
auth_service = AuthService()

@auth_router.post("/register", operation_id="user_registration")
async def register(user_data: UserCreate):
    try:
        # Initialize database connection asynchronously
        db = await Database.get_db()
        if db is None:
            logger.error("Database connection failed")
            raise HTTPException(status_code=500, detail="Database connection failed")
            
        # Create user
        result = await auth_service.register_user(user_data)
        logger.info(f"User registered successfully: {user_data.email}")
        return result
    except HTTPException as he:
        logger.error(f"HTTP error during registration: {str(he)}")
        raise he
    except Exception as e:
        error_detail = f"Registration error: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_detail)
        raise HTTPException(status_code=500, detail=str(e))

@auth_router.post("/login", operation_id="user_login")
async def login(user_data: UserLogin):
    try:
        # Initialize database connection asynchronously
        db = await Database.get_db()
        if db is None:
            logger.error("Database connection failed during login")
            raise HTTPException(status_code=500, detail="Database connection failed")
            
        # Login user
        result = await auth_service.login_user(user_data)
        logger.info(f"User logged in successfully: {user_data.email}")
        return result
    except HTTPException as he:
        logger.error(f"HTTP error during login: {str(he)}")
        raise he
    except Exception as e:
        error_detail = f"Login error: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_detail)
        raise HTTPException(status_code=500, detail=str(e))