from app.schemas.common import TimestampedModel


class MaterialRead(TimestampedModel):
    id: str
    tenant_id: str
    name: str
    sku: str | None = None
    unit: str
    current_stock: int
    minimum_stock: int
    is_active: bool
