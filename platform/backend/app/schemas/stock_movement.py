from datetime import datetime

from app.schemas.common import ORMModel


class StockMovementRead(ORMModel):
    id: str
    tenant_id: str
    material_id: str
    movement_type: str
    quantity: int
    reason: str | None = None
    notes: str | None = None
    created_at: datetime
