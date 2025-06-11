from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional

class Settings(BaseSettings):
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    DATABASE_SCHEMA: str = Field(default="public")
    DATABASE_POOL_SIZE: int = Field(default=20)
    DATABASE_MAX_OVERFLOW: int = Field(default=30)
    DATABASE_ECHO: bool = Field(default=False)
    ENVIRONMENT: str = Field(default="production")
    DEBUG: bool = Field(default=False)
    # Segurança/JWT
    SECRET_KEY: str = Field(default="changeme-secret-key")
    JWT_SECRET_KEY: str = Field(default="changeme-jwt-secret-key")
    JWT_ALGORITHM: str = Field(default="HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)
    # API
    API_V1_STR: str = Field(default="/api/v1")
    # Email/SMTP
    SMTP_HOST: str = Field(default="localhost")
    SMTP_PORT: int = Field(default=587)
    SMTP_USERNAME: str = Field(default="")
    SMTP_PASSWORD: str = Field(default="")
    SMTP_FROM_EMAIL: str = Field(default="noreply@example.com")
    SMTP_FROM_NAME: str = Field(default="Synapse")
    # Logging
    LOG_LEVEL: str = Field(default="INFO")
    LOG_FORMAT: str = Field(default="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    # Projeto
    PROJECT_NAME: str = Field(default="Synapse Backend")
    VERSION: str = Field(default="1.0.0")
    # CORS
    BACKEND_CORS_ORIGINS: list = Field(default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"])
    # Uploads
    UPLOAD_FOLDER: str = Field(default="uploads/")
    # Adicione outros campos conforme necessário para o projeto

    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development" or self.DEBUG

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # Ignorar campos extras do .env

settings = Settings() 