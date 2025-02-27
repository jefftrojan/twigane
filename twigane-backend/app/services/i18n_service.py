from app.models.i18n_models import LocaleString, AccessibilityPreferences
from app.core.database import Database
from fastapi import HTTPException
import json
from pathlib import Path

class I18nService:
    def __init__(self):
        self.db = Database.get_db()
        self.translations = self._load_translations()
        self.supported_languages = ["rw", "en"]

    def _load_translations(self) -> Dict:
        translations = {}
        translation_path = Path("/Users/mac/Downloads/main/twigane-backend/app/translations")
        
        for lang in ["rw", "en"]:
            file_path = translation_path / f"{lang}.json"
            if file_path.exists():
                with open(file_path, "r", encoding="utf-8") as f:
                    translations[lang] = json.load(f)
        return translations

    async def get_translation(self, key: str, lang: str = "rw") -> str:
        if lang not in self.supported_languages:
            lang = "rw"
        
        try:
            return self.translations[lang][key]
        except KeyError:
            return key

    async def get_user_preferences(self, user_id: str) -> AccessibilityPreferences:
        prefs = await self.db.accessibility_preferences.find_one({"user_id": user_id})
        if not prefs:
            return AccessibilityPreferences()
        return AccessibilityPreferences(**prefs)

    async def update_user_preferences(
        self, user_id: str, preferences: AccessibilityPreferences
    ) -> AccessibilityPreferences:
        await self.db.accessibility_preferences.update_one(
            {"user_id": user_id},
            {"$set": preferences.dict()},
            upsert=True
        )
        return preferences

    def translate_content(self, content: dict, target_lang: str) -> dict:
        if target_lang not in self.supported_languages:
            return content
            
        translated = content.copy()
        for key, value in content.items():
            if isinstance(value, dict) and all(k in value for k in self.supported_languages):
                translated[key] = value[target_lang]
        return translated