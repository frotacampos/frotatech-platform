from fastapi import APIRouter


router = APIRouter()


@router.get("/health")
def lumicity_health_check() -> dict[str, str]:
    return {"status": "ok", "module": "lumicity"}
