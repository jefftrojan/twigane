from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from app.core.config import settings
from fastapi import HTTPException

class TranslationService:
    _instance = None
    _model = None
    _tokenizer = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @property
    def model(self):
        if self._model is None:
            self._model = AutoModelForSeq2SeqLM.from_pretrained(settings.TRANSLATION_MODEL)
        return self._model

    @property
    def tokenizer(self):
        if self._tokenizer is None:
            self._tokenizer = AutoTokenizer.from_pretrained(settings.TRANSLATION_MODEL)
        return self._tokenizer

    async def translate(self, text: str, source_lang: str = "eng", target_lang: str = "kin") -> str:
        try:
            inputs = self.tokenizer(text, return_tensors="pt", padding=True)
            outputs = self.model.generate(**inputs)
            translated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            return translated_text
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")