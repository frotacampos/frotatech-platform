from app.schemas.common import TimestampedModel


class TenantRead(TimestampedModel):
    id: str
    name: str
    slug: str
    is_active: bool
