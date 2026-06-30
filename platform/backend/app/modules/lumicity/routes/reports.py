import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_tenant, get_current_user
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.report import Report
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.report import ReportAssign, ReportCreate, ReportRead, ReportStatusUpdate, ReportUpdate


router = APIRouter()


READ_ROLES = {"admin", "gestor", "operador", "cidadao"}
CREATE_ROLES = {"admin", "gestor", "operador", "cidadao"}
MANAGE_ROLES = {"admin", "gestor"}


def assert_role(user: User, roles: set[str]) -> None:
    if user.role not in roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role.")


def audit(
    db: Session,
    *,
    tenant_id: str,
    user_id: str,
    action: str,
    report_id: str,
    metadata: dict | None = None,
) -> None:
    db.add(
        AuditLog(
            tenant_id=tenant_id,
            user_id=user_id,
            action=action,
            entity_type="report",
            entity_id=report_id,
            metadata_json=json.dumps(metadata or {}),
        )
    )


def report_scope(statement, current_user: User, current_tenant: Tenant):
    statement = statement.where(Report.tenant_id == current_tenant.id)
    if current_user.role == "operador":
        return statement.where(Report.assigned_operator_id == current_user.id)
    if current_user.role == "cidadao":
        return statement.where(Report.created_by_user_id == current_user.id)
    return statement


def get_scoped_report(report_id: str, db: Session, current_user: User, current_tenant: Tenant) -> Report:
    report = db.scalar(report_scope(select(Report).where(Report.id == report_id), current_user, current_tenant))
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return report


@router.get("", response_model=list[ReportRead])
def list_reports(
    status_filter: str | None = Query(default=None, alias="status"),
    priority: str | None = None,
    city_id: str | None = None,
    assigned_operator_id: str | None = None,
    neighborhood: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
) -> list[Report]:
    assert_role(current_user, READ_ROLES)
    statement = report_scope(select(Report), current_user, current_tenant)
    if status_filter:
        statement = statement.where(Report.status == status_filter)
    if priority:
        statement = statement.where(Report.priority == priority)
    if city_id:
        statement = statement.where(Report.city_id == city_id)
    if assigned_operator_id:
        statement = statement.where(Report.assigned_operator_id == assigned_operator_id)
    if neighborhood:
        statement = statement.where(Report.neighborhood.ilike(f"%{neighborhood}%"))
    if date_from:
        statement = statement.where(Report.created_at >= date_from)
    if date_to:
        statement = statement.where(Report.created_at <= date_to)
    if search:
        pattern = f"%{search}%"
        statement = statement.where(or_(Report.title.ilike(pattern), Report.description.ilike(pattern), Report.address.ilike(pattern)))
    return list(db.scalars(statement.order_by(Report.created_at.desc())).all())


@router.post("", response_model=ReportRead, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
) -> Report:
    assert_role(current_user, CREATE_ROLES)
    tenant_id = current_tenant.id
    data = payload.model_dump(exclude={"tenant_id"})
    if current_user.role == "cidadao":
        data["citizen_name"] = data.get("citizen_name") or current_user.name
        data["citizen_cpf"] = data.get("citizen_cpf") or current_user.cpf
        data["citizen_phone"] = data.get("citizen_phone") or current_user.phone
    report = Report(**data, tenant_id=tenant_id, created_by_user_id=current_user.id)
    db.add(report)
    db.flush()
    audit(db, tenant_id=tenant_id, user_id=current_user.id, action="report.created", report_id=report.id)
    db.commit()
    db.refresh(report)
    return report


@router.get("/{report_id}", response_model=ReportRead)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
) -> Report:
    assert_role(current_user, READ_ROLES)
    return get_scoped_report(report_id, db, current_user, current_tenant)


@router.patch("/{report_id}", response_model=ReportRead)
def update_report(
    report_id: str,
    payload: ReportUpdate,
    db: Session = Depends(get_db),
    current_tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
) -> Report:
    assert_role(current_user, MANAGE_ROLES)
    report = get_scoped_report(report_id, db, current_user, current_tenant)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(report, key, value)
    audit(db, tenant_id=current_tenant.id, user_id=current_user.id, action="report.updated", report_id=report.id, metadata={"fields": sorted(data)})
    db.commit()
    db.refresh(report)
    return report


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
) -> None:
    assert_role(current_user, MANAGE_ROLES)
    report = get_scoped_report(report_id, db, current_user, current_tenant)
    audit(db, tenant_id=current_tenant.id, user_id=current_user.id, action="report.deleted", report_id=report.id)
    db.delete(report)
    db.commit()


@router.post("/{report_id}/assign", response_model=ReportRead)
def assign_report(
    report_id: str,
    payload: ReportAssign,
    db: Session = Depends(get_db),
    current_tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
) -> Report:
    assert_role(current_user, MANAGE_ROLES)
    report = get_scoped_report(report_id, db, current_user, current_tenant)
    operator = db.get(User, payload.operator_id)
    if not operator or operator.tenant_id != current_tenant.id or operator.role not in {"operador", "admin", "gestor"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid operator for tenant.")
    report.assigned_operator_id = operator.id
    audit(
        db,
        tenant_id=current_tenant.id,
        user_id=current_user.id,
        action="report.assigned",
        report_id=report.id,
        metadata={"operator_id": operator.id},
    )
    db.commit()
    db.refresh(report)
    return report


@router.patch("/{report_id}/status", response_model=ReportRead)
def change_report_status(
    report_id: str,
    payload: ReportStatusUpdate,
    db: Session = Depends(get_db),
    current_tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
) -> Report:
    if current_user.role not in {"admin", "gestor", "operador"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role.")
    report = get_scoped_report(report_id, db, current_user, current_tenant)
    old_status = report.status
    report.status = payload.status
    if payload.resolution_photo_url:
        report.resolution_photo_url = payload.resolution_photo_url
    audit(
        db,
        tenant_id=current_tenant.id,
        user_id=current_user.id,
        action="report.status_changed",
        report_id=report.id,
        metadata={
            "from": old_status,
            "to": payload.status,
            "notes": payload.notes,
            "resolution_photo_url": payload.resolution_photo_url,
        },
    )
    db.commit()
    db.refresh(report)
    return report
