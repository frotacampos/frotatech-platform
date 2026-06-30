from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_tenant, require_roles
from app.db.session import get_db
from app.models.stock_movement import StockMovement
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.stock_movement import StockMovementRead


router = APIRouter()


@router.get("/movements", response_model=list[StockMovementRead])
def list_stock_movements(
    db: Session = Depends(get_db),
    current_tenant: Tenant = Depends(get_current_tenant),
    _current_user: User = Depends(require_roles("admin", "gestor", "operador")),
) -> list[StockMovement]:
    return list(
        db.scalars(
            select(StockMovement)
            .where(StockMovement.tenant_id == current_tenant.id)
            .order_by(StockMovement.created_at.desc())
        ).all()
    )
