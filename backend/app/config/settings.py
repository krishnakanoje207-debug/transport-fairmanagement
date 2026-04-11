"""
SafeRoute - Application Settings
Centralized configuration loaded from environment variables
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "saferoute_db"

    # JWT
    SECRET_KEY: str = "saferoute-super-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # App
    APP_NAME: str = "SafeRoute"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # Admin seed
    ADMIN_EMAIL: str = "admin@saferoute.in"
    ADMIN_PASSWORD: str = "Admin@123"

    # Location
    SAFE_DISTANCE_LIMIT_METERS: int = 300
    GPS_UPDATE_INTERVAL_SECONDS: int = 10

    # Weather API (OpenWeatherMap free tier)
    WEATHER_API_KEY: str = ""
    WEATHER_API_URL: str = "https://api.openweathermap.org/data/2.5"

    # News API (newsapi.org free tier)
    NEWS_API_KEY: str = ""

    # EmailJS (free tier - 200/month)
    EMAILJS_SERVICE_ID: str = ""
    EMAILJS_TEMPLATE_ID: str = ""
    EMAILJS_PUBLIC_KEY: str = ""

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 5
    UPLOAD_DIR: str = "./uploads"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024


settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
