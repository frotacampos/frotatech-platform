from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_tenant, require_roles
from app.db.session import get_db
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.user import UserRead


router = APIRouter(prefix="/users")


class UserUpdate(BaseModel):
    role: str | None = None
    name: str | None = None
    phone: str | None = None
    cpf: str | None = None
    birth_date: str | None = None
    is_active: bool | None = None


@router.get("", response_model=list[UserRead])
def list_users(
    role: str | None = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_tenant: Tenant = Depends(get_current_tenant),
    _current_user: User = Depends(require_roles("admin", "gestor", "operador")),
) -> list[User]:
    statement = select(User).where(User.tenant_id == current_tenant.id)
    if not include_inactive:
        statement = statement.where(User.is_active.is_(True))
    if role:
        statement = statement.where(User.role == role)
    return list(db.scalars(statement.order_by(User.name.asc())).all())


@router.patch("/{user_id}", response_model=UserRead)
def update_user(
    user_id: str,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_tenant: Tenant = Depends(get_current_tenant),
    _current_user: User = Depends(require_roles("admin")),
) -> User:
    user = db.get(User, user_id)
    if not user or user.tenant_id != current_tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_roles("admin")),
) -> None:
    user = db.get(User, user_id)
    if not user or user.tenant_id != current_tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete your own user.")
    user.is_active = False
    db.commit()
