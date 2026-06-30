from os import getenv

from pydantic import BaseModel


def _database_url() -> str:
    raw_url = getenv("DATABASE_URL", "sqlite:///./frotatech_local.db").strip()
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql+psycopg://", 1)
    if raw_url.startswith("postgresql://"):
        return raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return raw_url


def _allowed_origins() -> list[str]:
    raw_origins = getenv("ALLOWED_ORIGINS") or getenv(
        "CORS_ORIGINS",
        "http://127.0.0.1:5173,http://localhost:5173",
    )
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


class Settings(BaseModel):
    app_name: str = "FrotaTech Platform Core"
    app_version: str = "0.1.0"
    api_v1_prefix: str = getenv("API_V1_PREFIX", "/api/v1")
    database_url: str = _database_url()
    secret_key: str = getenv("SECRET_KEY", "dev-only-change-me")
    algorithm: str = getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    cors_origins: list[str] = _allowed_origins()


settings = Settings()
