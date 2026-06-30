import base64
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.models.user import User


router = APIRouter(prefix="/storage")


class ImageUploadRequest(BaseModel):
    filename: str
    content_type: str | None = None
    data_url: str


def _extension(filename: str, content_type: str | None) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        return suffix
    if content_type == "image/png":
        return ".png"
    if content_type == "image/webp":
        return ".webp"
    if content_type == "image/gif":
        return ".gif"
    return ".jpg"


@router.post("/images")
def upload_image(
    payload: ImageUploadRequest,
    request: Request,
    _current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    if "," not in payload.data_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image payload.")

    header, encoded = payload.data_url.split(",", 1)
    if not header.startswith("data:image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image uploads are allowed.")

    try:
        content = base64.b64decode(encoded, validate=True)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image data.") from exc

    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Image too large.")

    uploads_dir = Path(__file__).resolve().parents[4] / "uploads" / "images"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    name = f"{uuid4().hex}{_extension(payload.filename, payload.content_type)}"
    path = uploads_dir / name
    path.write_bytes(content)

    file_url = str(request.base_url).rstrip("/") + f"/uploads/images/{name}"
    return {"file_url": file_url, "path": f"/uploads/images/{name}"}
