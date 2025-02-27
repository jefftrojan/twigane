from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import Dict, Any
from app.services.essay_service import EssayService
from app.services.emotion_service import EmotionService
from app.services.chatbot_service import ChatbotService
from app.services.tts_service import TextToSpeechService
from app.services.user_service import UserService
from app.api.auth_routes import auth_router
from app.api.content_routes import content_router
from app.api.assessment_routes import assessment_router
from app.api.adaptive_routes import adaptive_router
from app.api.analytics_routes import analytics_router
from app.api.notification_routes import notification_router
from app.api.i18n_routes import i18n_router
from app.middleware.accessibility import AccessibilityMiddleware
from app.api.mobile_routes import mobile_router

# Create main router
router = APIRouter()

# Add sub-routers
router.include_router(mobile_router, prefix="/mobile", tags=["mobile"])
router.include_router(i18n_router, prefix="/i18n", tags=["i18n"])
router.include_router(notification_router, prefix="/notifications", tags=["notifications"])
router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
router.include_router(adaptive_router, prefix="/adaptive", tags=["adaptive"])
router.include_router(assessment_router, prefix="/assessment", tags=["assessment"])
router.include_router(content_router, prefix="/content", tags=["content"])
router.include_router(auth_router, prefix="/auth", tags=["authentication"])

# Remove this line as middleware should be added in main.py
# app.add_middleware(AccessibilityMiddleware)

# Initialize services
essay_service = EssayService()
emotion_service = EmotionService()
chatbot_service = ChatbotService()
tts_service = TextToSpeechService()
user_service = UserService()

@router.post("/user/progress")
async def create_user_progress(user_id: str):
    return await user_service.create_user_progress(user_id)

@router.get("/user/progress/{user_id}")
async def get_user_progress(user_id: str):
    return await user_service.get_progress(user_id)

@router.put("/user/progress/{user_id}")
async def update_user_progress(user_id: str, update_data: dict):
    return await user_service.update_progress(user_id, update_data)

@router.post("/user/session")
async def create_user_session(user_id: str):
    return await user_service.create_session(user_id)

@router.get("/user/session/{user_id}")
async def get_user_session(user_id: str):
    return await user_service.get_session(user_id)

@router.put("/user/session/{user_id}")
async def update_user_session(
    user_id: str, 
    chat_history: list, 
    emotion_context: dict
):
    return await user_service.update_session(user_id, chat_history, emotion_context)

@router.post("/essay/analyze", 
    response_model=Dict,
    summary="Analyze handwritten essay",
    description="Analyzes a handwritten essay image and returns text extraction, translation, and analysis",
    responses={
        200: {
            "description": "Successful analysis",
            "content": {
                "application/json": {
                    "example": {
                        "original_text": "Sample essay text",
                        "translated_text": "Translated essay text",
                        "analysis": {
                            "pros": ["Clear main idea"],
                            "cons": ["Some grammar errors"],
                            "suggestions": ["Consider using more transition words"]
                        }
                    }
                }
            }
        },
        400: {"description": "Invalid file format or processing error"},
        422: {"description": "Invalid file type or empty file"},
        500: {"description": "Internal server error"}
    }
)
async def analyze_essay(
    file: UploadFile = File(..., description="Handwritten essay image file")
):
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=422,
                detail="File must be an image"
            )
            
        contents = await file.read()
        if not contents:
            raise HTTPException(
                status_code=422,
                detail="Empty file provided"
            )
            
        result = await essay_service.process_handwritten_essay(contents)
        return result
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/chat/message",
    response_model=Dict,
    summary="Send chat message",
    description="Send a message to the chatbot and get an AI-powered response",
    responses={
        200: {
            "description": "Successful response",
            "content": {
                "application/json": {
                    "example": {
                        "response": "Chatbot response",
                        "emotion_context": {"emotion": "positive", "confidence": 0.9}
                    }
                }
            }
        }
    }
)
async def chat_message(
    user_id: str = Query(..., description="User ID"),
    message: str = Query(..., description="Message text")
):
    try:
        response = await chatbot_service.get_response(user_id, message)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/emotion/analyze")
async def analyze_emotion(text: str):
    try:
        result = await emotion_service.analyze_emotion(text)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Remove the duplicate chat_message route that was here
@router.post("/tts/generate")
async def generate_speech(text: str):
    try:
        audio_data = await tts_service.generate_speech(text)
        return audio_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))