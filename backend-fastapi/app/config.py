# app/config.py
from pydantic_settings import BaseSettings
from pydantic import EmailStr
from pydantic import AnyUrl
from typing import Optional, Union

class Settings(BaseSettings):

    BACKEND_URL: str
    FRONTEND_URL: Union[AnyUrl, str] = "http://localhost:3000"

    # ---- DB 
    DATABASE_URL: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: Optional[str] = "localhost"
    DB_PORT: Optional[int] = 5432
    DB_NAME: Optional[str] = None

    # ---- Auth / CORS
    JWT_SECRET: str
    JWT_ALG: str = "HS256"
    CORS_ORIGINS: str = "*"

    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: Optional[str] = None
    GOOGLE_AUTH_URL: Optional[str] = None
    GOOGLE_TOKEN_URL: Optional[str] = None

    # ---- E-mail
    MAIL_SERVER: Optional[str] = None
    MAIL_PORT: Optional[int] = None
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_DEFAULT_SENDER: Optional[EmailStr] = None
    MAIL_USE_TLS: bool = True

    # ---- OpenAI
    OPENAI_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
