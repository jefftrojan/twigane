from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Twigane"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "twigane_db"
    
    # Model configurations
    TRANSLATION_MODEL: str = "mbazaNLP/Nllb_finetuned_education_en_kin"
    EMOTION_MODEL: str = "joeddav/distilbert-base-uncased-go-emotions"
    
    class Config:
        case_sensitive = True

settings = Settings()