from transformers import AutoTokenizer, AutoModelForSeq2SeqTranslation
from app.core.config import settings

class TranslationService:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained(settings.TRANSLATION_MODEL)
        self.model = AutoModelForSeq2SeqTranslation.from_pretrained(settings.TRANSLATION_MODEL)

    async def translate_text(self, text: str, source_lang: str = "eng_Latn", target_lang: str = "kin_Latn") -> str:
        inputs = self.tokenizer(text, return_tensors="pt", padding=True)
        translated = self.model.generate(
            **inputs,
            forced_bos_token_id=self.tokenizer.lang_code_to_id[target_lang],
            max_length=128
        )
        return self.tokenizer.batch_decode(translated, skip_special_tokens=True)[0]