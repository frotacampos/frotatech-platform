from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import TimestampedModel


class ReportCreate(BaseModel):
    tenant_id: str | None = None
    city_id: str | None = None
    title: str = Field(..., min_length=3, max_length=180)
    description: str = Field(..., min_length=3)
    status: str = "aberto"
    priority: str = "media"
    address: str | None = None
    neighborhood: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    photo_url: str | None = None
    resolution_photo_url: str | None = None
    citizen_name: str | None = None
    citizen_cpf: str | None = None
    citizen_phone: str | None = None


class ReportRead(TimestampedModel):
    id: str
    tenant_id: str
    city_id: str | None = None
    created_by_user_id: str | None = None
    assigned_operator_id: str | None = None
    title: str
    description: str
    status: str
    priority: str
    address: str | None = None
    neighborhood: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    photo_url: str | None = None
    resolution_photo_url: str | None = None
    citizen_name: str | None = None
    citizen_cpf: str | None = None
    citizen_phone: str | None = None
    created_at: datetime
    updated_at: datetime


class ReportUpdate(BaseModel):
    city_id: str | None = None
    title: str | None = Field(default=None, min_length=3, max_length=180)
    description: str | None = Field(default=None, min_length=3)
    priority: str | None = None
    address: str | None = None
    neighborhood: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    photo_url: str | None = None
    resolution_photo_url: str | None = None
    citizen_name: str | None = None
    citizen_cpf: str | None = None
    citizen_phone: str | None = None


class ReportAssign(BaseModel):
    operator_id: str


class ReportStatusUpdate(BaseModel):
    status: str
    notes: str | None = None
    resolution_photo_url: str | None = None
