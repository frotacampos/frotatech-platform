from fastapi import APIRouter

from app.modules.lumicity.routes import health, materials, reports, stock


router = APIRouter(prefix="/lumicity")
router.include_router(health.router, tags=["lumicity"])
router.include_router(reports.router, prefix="/reports", tags=["lumicity-reports"])
router.include_router(materials.router, prefix="/materials", tags=["lumicity-materials"])
router.include_router(stock.router, prefix="/stock", tags=["lumicity-stock"])
