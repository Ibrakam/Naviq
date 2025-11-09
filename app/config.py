from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./naviq.db"
    
    # JWT
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # OpenAI
    openai_api_key: str = ""
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # Email
    sendgrid_api_key: str = ""
    from_email: str = "noreply@naviq.com"
    
    # App settings
    debug: bool = True
    allowed_hosts: List[str] = ["localhost", "127.0.0.1"]
    
    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    
    class Config:
        env_file = ".env"


settings = Settings()
