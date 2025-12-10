
import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agentic AI Assistant"
    API_V1_STR: str = "/api/v1"
    
    # AI Keys
    GEMINI_API_KEY: str
    YOUTUBE_API_KEY: Optional[str] = None
    
    # Feature Flags
    ENABLE_COST_ESTIMATOR: bool = True
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
