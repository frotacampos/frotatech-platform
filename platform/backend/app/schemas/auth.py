from pydantic import BaseModel

from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    email: str
    password: str


class CitizenRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: str | None = None
    cpf: str | None = None
    birth_date: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CurrentUserResponse(UserRead):
    tenant_name: str
