from fastapi import APIRouter


router = APIRouter()

MODULES = [
    {
        "key": "lumicity",
        "name": "LumiCity",
        "status": "foundation",
        "description": "Public lighting management module.",
    },
    {
        "key": "urbaneye",
        "name": "UrbanEye AI",
        "status": "planned",
        "description": "Urban monitoring and AI vision module.",
    },
    {
        "key": "aquaflow",
        "name": "AquaFlow",
        "status": "planned",
        "description": "Water operations and flow management module.",
    },
]


@router.get("/modules")
def list_modules() -> dict[str, list[dict[str, str]]]:
    return {"modules": MODULES}

