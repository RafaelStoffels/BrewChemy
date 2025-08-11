from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALG: str = "HS256"
    CORS_ORIGINS: str = "*"
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
