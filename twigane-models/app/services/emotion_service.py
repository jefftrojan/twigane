from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from app.services.translation_service import TranslationService
import logging

logger = logging.getLogger(__name__)

class EmotionService:
    def __init__(self):
        try:
            # Use a public model that doesn't require authentication
            model_name = "bhadresh-savani/distilbert-base-uncased-emotion"
            self.emotion_classifier = pipeline(
                "text-classification",
                model=model_name,
                tokenizer=model_name,
                return_all_scores=True
            )
            self.translation_service = TranslationService()
            logger.info("Emotion service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize emotion service: {e}")
            raise

    async def analyze_emotion(self, text: str) -> dict:
        try:
            # Get emotion predictions
            emotions = self.emotion_classifier(text)[0]
            
            # Format results
            emotion_scores = {
                pred['label']: pred['score']
                for pred in emotions
            }
            
            # Get top emotion
            top_emotion = max(emotions, key=lambda x: x['score'])
            
            return {
                "emotions": emotion_scores,
                "dominant_emotion": top_emotion['label'],
                "confidence": top_emotion['score'],
                "original_text": text
            }
        except Exception as e:
            logger.error(f"Emotion analysis failed: {e}")
            raise