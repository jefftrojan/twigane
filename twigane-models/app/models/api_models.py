from pydantic import BaseModel
from typing import List, Optional

class EmotionResponse(BaseModel):
    emotion: str
    confidence: float
    description: str

class EmotionAnalysis(BaseModel):
    original_text: str
    emotions: List[EmotionResponse]

class EssayAnalysis(BaseModel):
    original_text: str
    translated_text: str
    analysis: dict

class ChatResponse(BaseModel):
    original_message: str
    response: str
    emotion_context: dict

class AudioResponse(BaseModel):
    audio_data: str
    content_type: str