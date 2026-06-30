from app.schemas.common import TimestampedModel


class CityRead(TimestampedModel):
    id: str
    tenant_id: str
    name: str
    state: str
    ibge_code: str | None = None
    is_active: bool
