# app/config.py
from pydantic_settings import BaseSettings
from pydantic import EmailStr
from pydantic import AnyUrl
from typing import Optional, Union

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
    FRONTEND_URL: Union[AnyUrl, str] = "http://localhost:3000"

    # --- Google OAuth ---
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: Optional[str] = None
    GOOGLE_AUTH_URL: Optional[str] = None
    GOOGLE_TOKEN_URL: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
