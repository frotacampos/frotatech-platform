from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_tenant, require_roles
from app.db.session import get_db
from app.models.material import Material
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.material import MaterialRead


router = APIRouter()


@router.get("", response_model=list[MaterialRead])
def list_materials(
    db: Session = Depends(get_db),
    current_tenant: Tenant = Depends(get_current_tenant),
    _current_user: User = Depends(require_roles("admin", "gestor", "operador")),
) -> list[Material]:
    return list(
        db.scalars(
            select(Material)
            .where(Material.tenant_id == current_tenant.id, Material.is_active.is_(True))
            .order_by(Material.name.asc())
        ).all()
    )
