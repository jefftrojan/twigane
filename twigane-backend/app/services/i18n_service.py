from app.models.i18n_models import LocaleString, AccessibilityPreferences
from app.core.database import Database
from fastapi import HTTPException
import json
from pathlib import Path
from typing import Dict

class I18nService:
    def __init__(self):
        self.db = Database.get_db()
        self.translations = self._load_translations()

    async def _load_translations(self) -> Dict:
        """Load translations from database"""
        translations = {}
        try:
            cursor = self.db.translations.find({})
            async for doc in cursor:
                lang = doc.get("language")
                translations[lang] = doc.get("translations", {})
            return translations
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to load translations: {str(e)}"
            )

    async def get_translation(self, key: str, language: str = "kin") -> str:
        """Get translation for a specific key in given language"""
        if language not in self.translations:
            raise HTTPException(
                status_code=404, 
                detail=f"Language {language} not found"
            )
        
        return self.translations[language].get(
            key, 
            self.translations["eng"].get(key, key)
        )

    async def add_translation(
        self, 
        language: str, 
        key: str, 
        value: str
    ) -> Dict:
        """Add or update a translation"""
        try:
            result = await self.db.translations.update_one(
                {"language": language},
                {"$set": {f"translations.{key}": value}},
                upsert=True
            )
            
            # Refresh translations cache
            self.translations = await self._load_translations()
            
            return {
                "status": "success",
                "modified": result.modified_count > 0,
                "language": language,
                "key": key
            }
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to add translation: {str(e)}"
            )

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