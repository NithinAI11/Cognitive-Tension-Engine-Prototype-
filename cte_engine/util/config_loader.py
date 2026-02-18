# FILE: cte_engine/util/config_loader.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path
import os

# Dynamic path finding to ensure .env is found
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    # Infrastructure
    MONGO_URI: str = "mongodb://localhost:27029"
    REDIS_URL: str = "redis://localhost:6399"
    QDRANT_URL: str = "http://localhost:6343"
    SEARXNG_URL: str = "http://localhost:8080"
    
    # Providers
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    TAVILY_API_KEY: Optional[str] = None  # Phase 2 Fallback
    
    # System
    DEFAULT_MODEL: str = "gemini-2.0-flash"

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding='utf-8',
        extra="ignore"
    )

settings = Settings()

if not settings.GEMINI_API_KEY:
    print(f"⚠️ Config Loader: .env looked for at {ENV_PATH} but GEMINI_API_KEY is missing.")
else:
    print(f"✅ Config Loader: API Keys loaded successfully.")