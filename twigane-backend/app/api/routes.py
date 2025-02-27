from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import Dict, Any
from app.services.essay_service import EssayService
from app.services.emotion_service import EmotionService
from app.services.chatbot_service import ChatbotService
from app.services.tts_service import TextToSpeechService
from app.services.user_service import UserService

router = APIRouter()

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

@router.post("/essay/analyze")
async def analyze_essay(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        result = await essay_service.process_handwritten_essay(contents)
        return result
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