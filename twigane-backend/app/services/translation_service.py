from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from app.core.config import settings
from fastapi import HTTPException

class TranslationService:
    SUPPORTED_LANGUAGES = {
        "eng": "English",
        "kin": "Kinyarwanda"  # Limiting to English-Kinyarwanda pair
    }

    def __init__(self):
        try:
            model_name = "mbazaNLP/Nllb_finetuned_education_en_kin"
            self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize translation service: {str(e)}"
            )

    async def translate(self, text: str, source_lang: str = "eng", target_lang: str = "kin") -> str:
        try:
            # Validate languages
            if source_lang != "eng" or target_lang != "kin":
                raise HTTPException(
                    status_code=400,
                    detail="This model only supports English to Kinyarwanda translation"
                )

            inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
            outputs = self.model.generate(
                **inputs,
                max_length=512,
                num_beams=4,
                length_penalty=0.6,
                early_stopping=True
            )
            translated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            return translated_text
            
        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Translation failed: {str(e)}"
            )