from app.schemas.common import TimestampedModel


class UserRead(TimestampedModel):
    id: str
    tenant_id: str
    name: str
    email: str
    role: str
    cpf: str | None = None
    phone: str | None = None
    birth_date: str | None = None
    is_active: bool
