from fastapi import APIRouter, Depends, HTTPException
from app.services.i18n_service import I18nService
from app.middleware.auth import AuthMiddleware
from app.models.i18n_models import AccessibilityPreferences

i18n_router = APIRouter()
i18n_service = I18nService()
auth = AuthMiddleware()

@i18n_router.get("/preferences")
async def get_preferences(current_user: dict = Depends(auth)):
    return await i18n_service.get_user_preferences(current_user["sub"])

@i18n_router.put("/preferences")
async def update_preferences(
    preferences: AccessibilityPreferences,
    current_user: dict = Depends(auth)
):
    return await i18n_service.update_user_preferences(
        current_user["sub"],
        preferences
    )

@i18n_router.get("/translations/{lang}")
async def get_translations(lang: str):
    if lang not in i18n_service.supported_languages:
        raise HTTPException(status_code=400, detail="Language not supported")
    return i18n_service.translations.get(lang, {})