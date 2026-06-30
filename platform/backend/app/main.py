from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import settings


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="FrotaTech Platform Core API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_path = Path(__file__).resolve().parents[1] / "uploads"
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")


@app.get("/", tags=["root"])
def root() -> dict[str, object]:
    return {
        "service": "frotatech-platform-core",
        "status": "ok",
        "endpoints": ["/health", "/api/v1/health", "/api/v1/modules", "/api/v1/lumicity/health", "/docs"],
    }


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "frotatech-platform-core"}


app.include_router(api_router, prefix=settings.api_v1_prefix)
