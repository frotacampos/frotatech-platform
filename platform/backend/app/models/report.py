from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str] = mapped_column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    city_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("cities.id"), nullable=True, index=True)
    created_by_user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    assigned_operator_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="aberto", index=True)
    priority: Mapped[str] = mapped_column(String(40), nullable=False, default="media")
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    neighborhood: Mapped[str | None] = mapped_column(String(120), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resolution_photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    citizen_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    citizen_cpf: Mapped[str | None] = mapped_column(String(20), nullable=True)
    citizen_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="reports")
    city = relationship("City", back_populates="reports")
    assigned_operator = relationship("User", foreign_keys=[assigned_operator_id], back_populates="assigned_reports")
    created_by_user = relationship("User", foreign_keys=[created_by_user_id])
