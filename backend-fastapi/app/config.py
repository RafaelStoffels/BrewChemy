# app/config.py
from pydantic_settings import BaseSettings
from pydantic import EmailStr
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALG: str = "HS256"
    CORS_ORIGINS: str = "*"

    MAIL_SERVER: str
    MAIL_PORT: int
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_DEFAULT_SENDER: EmailStr
    MAIL_USE_TLS: bool = True

    BACKEND_URL: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
