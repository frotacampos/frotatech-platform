from datetime import UTC, datetime

from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.audit_log import AuditLog
from app.models.city import City
from app.models.material import Material
from app.models.report import Report
from app.models.stock_movement import StockMovement
from app.models.tenant import Tenant
from app.models.user import User


def utc_now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def run() -> None:
    db = SessionLocal()
    try:
        tenant = db.scalar(select(Tenant).where(Tenant.slug == "frotatech-demo"))
        if not tenant:
            tenant = Tenant(name="FrotaTech Demo", slug="frotatech-demo")
            db.add(tenant)
            db.flush()

        city = db.scalar(select(City).where(City.tenant_id == tenant.id).order_by(City.created_at.asc()))
        if not city:
            city = City(tenant_id=tenant.id, name="Cidade Demo", state="AM", ibge_code="1302603")
            db.add(city)
            db.flush()

        demo_users = [
            ("Admin FrotaTech", "admin@frotatech.demo", "admin", "admin123"),
            ("Gestor FrotaTech", "gestor@frotatech.demo", "gestor", "gestor123"),
            ("Operador FrotaTech", "operador@frotatech.demo", "operador", "operador123"),
            ("Cidadao FrotaTech", "cidadao@frotatech.demo", "cidadao", "cidadao123"),
        ]
        users_by_email = {}
        for name, email, role, password in demo_users:
            user = db.scalar(select(User).where(User.email == email))
            if not user:
                user = User(
                    tenant_id=tenant.id,
                    name=name,
                    email=email,
                    role=role,
                    password_hash=get_password_hash(password),
                )
                db.add(user)
            else:
                user.tenant_id = tenant.id
                user.name = name
                user.role = role
                user.password_hash = get_password_hash(password)
                user.is_active = True
            users_by_email[email] = user
        db.flush()
        admin = users_by_email["admin@frotatech.demo"]
        citizen = users_by_email["cidadao@frotatech.demo"]
        citizen.cpf = "00000000000"
        citizen.phone = "(92) 99999-0003"
        citizen.birth_date = "1990-01-01"

        materials = list(db.scalars(select(Material).where(Material.tenant_id == tenant.id)).all())
        if not materials:
            materials = [
                Material(tenant_id=tenant.id, name="Lampada LED 100W", sku="LED-100W", unit="un", current_stock=24, minimum_stock=8),
                Material(tenant_id=tenant.id, name="Rele fotoeletrico", sku="REL-FOTO", unit="un", current_stock=18, minimum_stock=6),
                Material(tenant_id=tenant.id, name="Braco luminaria 3m", sku="BRACO-3M", unit="un", current_stock=7, minimum_stock=3),
            ]
            db.add_all(materials)
            db.flush()

        existing_report = db.scalar(select(Report).where(Report.tenant_id == tenant.id))
        if not existing_report:
            reports = [
                Report(
                    tenant_id=tenant.id,
                    city_id=city.id,
                    title="Luminaria apagada na avenida principal",
                    description="Poste apagado ha tres noites proximo ao mercado central.",
                    status="aberto",
                    priority="alta",
                    address="Av. Principal, 1000",
                    neighborhood="Centro",
                    latitude=-3.1190,
                    longitude=-60.0217,
                    citizen_name="Maria Demo",
                    citizen_cpf="11122233344",
                    citizen_phone="(92) 99999-0001",
                ),
                Report(
                    tenant_id=tenant.id,
                    city_id=city.id,
                    assigned_operator_id=admin.id,
                    title="Piscando em rua residencial",
                    description="Luminaria piscando durante a noite inteira.",
                    status="em_andamento",
                    priority="media",
                    address="Rua das Flores, 55",
                    neighborhood="Jardim Luz",
                    latitude=-3.1105,
                    longitude=-60.0302,
                    citizen_name="Joao Demo",
                    citizen_cpf="55566677788",
                    citizen_phone="(92) 99999-0002",
                ),
                Report(
                    tenant_id=tenant.id,
                    city_id=city.id,
                    title="Braco de luminaria danificado",
                    description="Braco parece torto apos chuva forte.",
                    status="aberto",
                    priority="media",
                    address="Travessa Norte, 21",
                    neighborhood="Novo Bairro",
                    latitude=-3.1001,
                    longitude=-60.0188,
                ),
            ]
            db.add_all(reports)
        else:
            existing_reports = db.scalars(select(Report).where(Report.tenant_id == tenant.id, Report.created_by_user_id.is_(None))).all()
            for report in existing_reports:
                report.created_by_user_id = admin.id

        for report in db.scalars(select(Report).where(Report.tenant_id == tenant.id)).all():
            if report.citizen_name == "Maria Demo" and not report.citizen_cpf:
                report.citizen_cpf = "11122233344"
            if report.citizen_name == "Joao Demo" and not report.citizen_cpf:
                report.citizen_cpf = "55566677788"

        existing_movement = db.scalar(select(StockMovement).where(StockMovement.tenant_id == tenant.id))
        if not existing_movement and materials:
            movements = [
                StockMovement(tenant_id=tenant.id, material_id=materials[0].id, movement_type="entrada", quantity=24, reason="Seed demo"),
                StockMovement(tenant_id=tenant.id, material_id=materials[1].id, movement_type="entrada", quantity=18, reason="Seed demo"),
                StockMovement(tenant_id=tenant.id, material_id=materials[2].id, movement_type="entrada", quantity=7, reason="Seed demo"),
            ]
            db.add_all(movements)

        existing_audit = db.scalar(select(AuditLog).where(AuditLog.tenant_id == tenant.id, AuditLog.action == "demo.seeded"))
        if not existing_audit:
            db.add(
                AuditLog(
                    tenant_id=tenant.id,
                    user_id=admin.id,
                    action="demo.seeded",
                    entity_type="tenant",
                    entity_id=tenant.id,
                    metadata_json='{"seed":"frotatech-demo"}',
                    created_at=utc_now(),
                )
            )

        db.commit()
        print("Demo seed ensured.")
        print("Users: admin@frotatech.demo/admin123, gestor@frotatech.demo/gestor123, operador@frotatech.demo/operador123, cidadao@frotatech.demo/cidadao123")
    finally:
        db.close()


if __name__ == "__main__":
    run()
