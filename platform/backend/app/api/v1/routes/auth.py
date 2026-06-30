from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_tenant, get_current_user
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import get_db
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.auth import CitizenRegisterRequest, CurrentUserResponse, LoginRequest, TokenResponse
from app.schemas.user import UserRead


router = APIRouter(prefix="/auth")


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/register-citizen", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_citizen(payload: CitizenRegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email = payload.email.strip().lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail already registered.")

    tenant = db.scalar(select(Tenant).where(Tenant.slug == "frotatech-demo"))
    if not tenant:
        tenant = db.scalar(select(Tenant).where(Tenant.is_active.is_(True)).order_by(Tenant.created_at.asc()))
    if not tenant:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No active tenant available.")

    user = User(
        tenant_id=tenant.id,
        name=payload.name.strip(),
        email=email,
        role="cidadao",
        cpf=(payload.cpf or "").strip() or None,
        phone=(payload.phone or "").strip() or None,
        birth_date=(payload.birth_date or "").strip() or None,
        password_hash=get_password_hash(payload.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me", response_model=CurrentUserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
) -> CurrentUserResponse:
    user_data = UserRead.model_validate(current_user).model_dump()
    return CurrentUserResponse(**user_data, tenant_name=current_tenant.name)
