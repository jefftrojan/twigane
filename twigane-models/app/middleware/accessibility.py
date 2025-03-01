from fastapi import Request
from app.services.i18n_service import I18nService
from typing import Callable
import json

class AccessibilityMiddleware:
    def __init__(self):
        self.i18n_service = I18nService()

    async def __call__(self, request: Request, call_next: Callable):
        # Get user preferences from header or token
        user_id = request.state.user.get("sub") if hasattr(request.state, "user") else None
        
        if user_id:
            # Get user's accessibility preferences
            preferences = await self.i18n_service.get_user_preferences(user_id)
            request.state.accessibility = preferences
            
            # Get user's language preference
            lang = request.headers.get("Accept-Language", "rw").split(",")[0]
            request.state.lang = lang if lang in ["rw", "en"] else "rw"
            
            response = await call_next(request)
            
            # If response is JSON, apply accessibility transformations
            if response.headers.get("content-type") == "application/json":
                body = json.loads(response.body)
                transformed_body = self._transform_response(body, preferences, lang)
                response.body = json.dumps(transformed_body).encode()
                
            return response
        
        return await call_next(request)

    def _transform_response(
        self, data: dict, preferences: dict, lang: str
    ) -> dict:
        if preferences.get("simplified_ui"):
            data = self._simplify_content(data)
            
        if lang != "rw":
            data = self.i18n_service.translate_content(data, lang)
            
        return data

    def _simplify_content(self, data: dict) -> dict:
        # Implement content simplification logic
        # Remove non-essential information for simplified UI
        if isinstance(data, dict):
            return {k: self._simplify_content(v) for k, v in data.items() 
                   if not k.startswith("_")}
        return data