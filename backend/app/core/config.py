import os
from pydantic_settings import BaseSettings
from typing import List

_BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
_DEFAULT_DB_FILE = os.path.join(_BACKEND_DIR, "ai_security_faster.db").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI SECURITY FASTER"
    VERSION: str = "2.0.0"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "ai-security-faster-super-secret-enterprise-jwt-key-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    DATABASE_URL: str = f"sqlite:///{_DEFAULT_DB_FILE}"

    # API Keys
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    EMAIL_API_KEY: str = ""
    EMAIL_FROM: str = "AI Security Faster <onboarding@resend.dev>"
    EMAIL_PROVIDER: str = "resend" # resend, sendgrid, smtp

    # SMTP Settings (Alternative to Resend/SendGrid)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    CLAUDE_DEFAULT_MODEL: str = "claude-3-5-sonnet-20241022"
    GEMINI_DEFAULT_MODEL: str = "gemini-1.5-pro"

    # Wazuh Config
    WAZUH_API_URL: str = "https://localhost:55000"
    WAZUH_USER: str = "wazuh"
    WAZUH_PASSWORD: str = "wazuh_password"
    WAZUH_SIMULATED_MODE: bool = True

    # Sandbox
    SANDBOX_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/sandbox"))
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:5174"

    class Config:
        env_file = (
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env")),
            ".env"
        )
        extra = "allow"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()

# Ensure sandbox directory exists
os.makedirs(settings.SANDBOX_DIR, exist_ok=True)

