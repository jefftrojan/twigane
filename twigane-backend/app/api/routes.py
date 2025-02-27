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

# Add mobile routes with authentication
router.include_router(mobile_router, prefix="/mobile", tags=["mobile"])

# Add i18n routes with authentication
router.include_router(i18n_router, prefix="/i18n", tags=["i18n"])

# Add accessibility middleware
app.add_middleware(AccessibilityMiddleware)

# Add notification routes with authentication
router.include_router(notification_router, prefix="/notifications", tags=["notifications"])

# Add analytics routes with authentication
router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])

# Add adaptive learning routes with authentication
router.include_router(adaptive_router, prefix="/adaptive", tags=["adaptive"])

# Add assessment routes with authentication
router.include_router(assessment_router, prefix="/assessment", tags=["assessment"])

# Add content routes with authentication
router.include_router(content_router, prefix="/content", tags=["content"])

# Add profile routes with authentication
router.include_router(profile_router, prefix="/profile", tags=["profile"])

# Add auth routes without authentication middleware
router.include_router(auth_router, prefix="/auth", tags=["authentication"])

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
        400: {"description": "Invalid file format or processing error"}
    }
)
async def analyze_essay(
    file: UploadFile = File(..., description="Handwritten essay image file")
):
    try:
        contents = await file.read()
        result = await essay_service.process_handwritten_essay(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

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

@router.post("/chat/message")
async def chat_message(user_id: str, message: str):
    try:
        response = await chatbot_service.get_response(user_id, message)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/tts/generate")
async def generate_speech(text: str):
    try:
        audio_data = await tts_service.generate_speech(text)
        return audio_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))