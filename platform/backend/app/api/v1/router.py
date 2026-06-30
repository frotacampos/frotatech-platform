from fastapi import APIRouter

from app.api.v1.routes import ai, auth, health, modules, storage, users
from app.modules.lumicity.router import router as lumicity_router


api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, tags=["users"])
api_router.include_router(storage.router, tags=["storage"])
api_router.include_router(ai.router, tags=["ai"])
api_router.include_router(health.router, tags=["health"])
api_router.include_router(modules.router, tags=["modules"])
api_router.include_router(lumicity_router)
