from datetime import datetime

from app.schemas.common import ORMModel


class AuditLogRead(ORMModel):
    id: str
    tenant_id: str | None = None
    user_id: str | None = None
    action: str
    entity_type: str
    entity_id: str | None = None
    metadata_json: str | None = None
    created_at: datetime
