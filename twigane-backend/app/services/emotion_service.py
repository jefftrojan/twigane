from transformers import pipeline
from PIL import Image
import torch
from app.services.translation_service import TranslationService

class EmotionService:
    def __init__(self):
        self.emotion_classifier = pipeline("text-classification", 
                                        model="joeddav/distilbert-base-uncased-go-emotions",
                                        top_k=3)
        self.translation_service = TranslationService()
        
    async def analyze_emotion(self, text: str) -> dict:
        # Translate Kinyarwanda to English for analysis
        english_text = await self.translation_service.translate_text(
            text, source_lang="kin_Latn", target_lang="eng_Latn"
        )
        
        # Get emotion predictions
        emotions = self.emotion_classifier(english_text)
        
        # Translate emotion descriptions back to Kinyarwanda
        translated_emotions = []
        for emotion in emotions:
            emotion_desc = await self.translation_service.translate_text(
                f"This text expresses {emotion['label']}", 
                source_lang="eng_Latn", 
                target_lang="kin_Latn"
            )
            translated_emotions.append({
                "emotion": emotion['label'],
                "confidence": emotion['score'],
                "description": emotion_desc
            })
            
        return {
            "original_text": text,
            "emotions": translated_emotions
        }