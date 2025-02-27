from transformers import pipeline
import cv2
import numpy as np
from app.services.translation_service import TranslationService

class EssayService:
    def __init__(self):
        self.translation_service = TranslationService()
        self.ocr_model = pipeline("image-to-text", model="microsoft/trocr-large-handwritten")
        
    async def process_handwritten_essay(self, image_bytes: bytes) -> dict:
        # Convert image bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Perform OCR
        text = self.ocr_model(image)[0]['generated_text']
        
        # Translate to Kinyarwanda
        translated_text = await self.translation_service.translate_text(text)
        
        # Analyze essay
        analysis = await self._analyze_essay(text)
        
        return {
            "original_text": text,
            "translated_text": translated_text,
            "analysis": analysis
        }
    
    async def _analyze_essay(self, text: str) -> dict:
        # Analyze essay structure and content
        paragraphs = text.split('\n\n')
        sentences = text.split('.')
        words = text.split()
        
        # Basic metrics
        metrics = {
            "word_count": len(words),
            "sentence_count": len(sentences),
            "paragraph_count": len(paragraphs),
            "avg_words_per_sentence": len(words) / max(len(sentences), 1)
        }
        
        # Analyze structure and content
        pros = []
        cons = []
        suggestions = []
        
        # Structure analysis
        if len(paragraphs) >= 3:
            pros.append("Good paragraph structure")
        else:
            cons.append("Needs better paragraph organization")
            suggestions.append("Break content into at least 3 paragraphs")
            
        if 10 <= metrics["avg_words_per_sentence"] <= 20:
            pros.append("Good sentence length")
        elif metrics["avg_words_per_sentence"] > 20:
            cons.append("Sentences are too long")
            suggestions.append("Consider breaking long sentences into shorter ones")
        else:
            cons.append("Sentences are too short")
            suggestions.append("Try combining some short sentences")
            
        # Content analysis
        if metrics["word_count"] >= 200:
            pros.append("Good essay length")
        else:
            cons.append("Essay is too short")
            suggestions.append("Expand your ideas with more details")
            
        return {
            "metrics": metrics,
            "pros": pros,
            "cons": cons,
            "suggestions": suggestions
        }