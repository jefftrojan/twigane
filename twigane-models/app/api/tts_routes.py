from fastapi import APIRouter, HTTPException, Query
from app.services.tts_service import TTSService
from typing import Optional

tts_router = APIRouter()
tts_service = TTSService()

SUPPORTED_LANGUAGES = {
    'en': 'English',
    'fr': 'French',
    'sw': 'Swahili',
    'rw': 'Kinyarwanda'  # We'll map this to another supported language
}

@tts_router.post("/generate")
async def generate_speech(
    text: str = Query(..., description="Text to convert to speech"),
    language: Optional[str] = Query('en', description="Language code (en, fr, sw)")
):
    try:
        # Map 'rw' to a supported language (e.g., English)
        if language == 'rw':
            language = 'en'
            
        # Validate language
        if language not in SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=400, 
                detail=f"Language '{language}' not supported. Supported languages: {list(SUPPORTED_LANGUAGES.keys())}"
            )
            
        audio_data = await tts_service.generate_speech(text, language)
        return {"audio_url": audio_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))