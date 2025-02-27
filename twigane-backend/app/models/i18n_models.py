from pydantic import BaseModel
from typing import Dict, Optional

class LocaleString(BaseModel):
    rw: str
    en: Optional[str]

class AccessibilityPreferences(BaseModel):
    text_to_speech: bool = False
    high_contrast: bool = False
    font_size: str = "medium"
    simplified_ui: bool = False
    screen_reader_optimized: bool = False
    motion_reduced: bool = False
    color_blind_mode: str = "none"