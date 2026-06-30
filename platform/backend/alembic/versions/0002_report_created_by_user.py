"""Add report creator link

Revision ID: 0002_report_created_by_user
Revises: 0001_initial_lumicity_domain
Create Date: 2026-06-29
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0002_report_created_by_user"
down_revision: str | None = "0001_initial_lumicity_domain"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("reports") as batch_op:
        batch_op.add_column(sa.Column("created_by_user_id", sa.String(length=36), nullable=True))
        batch_op.create_index("ix_reports_created_by_user_id", ["created_by_user_id"])
        batch_op.create_foreign_key("fk_reports_created_by_user_id_users", "users", ["created_by_user_id"], ["id"])


def downgrade() -> None:
    with op.batch_alter_table("reports") as batch_op:
        batch_op.drop_constraint("fk_reports_created_by_user_id_users", type_="foreignkey")
        batch_op.drop_index("ix_reports_created_by_user_id")
        batch_op.drop_column("created_by_user_id")
