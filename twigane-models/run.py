import uvicorn
import logging
import asyncio
from app.main import app
from app.services.translation_service import TranslationService
from app.services.emotion_service import EmotionService

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

async def init_models():
    """Initialize ML models before server startup"""
    logger.info("Initializing ML models...")
    try:
        # Initialize models in background
        translation_service = TranslationService()
        emotion_service = EmotionService()
        logger.info("ML models initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize models: {str(e)}")
        raise

if __name__ == "__main__":
    logger.info("Starting Twigane Backend Server...")
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="debug",
            workers=1,
        )
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
