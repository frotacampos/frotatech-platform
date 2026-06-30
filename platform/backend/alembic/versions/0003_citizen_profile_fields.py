"""Add citizen profile fields

Revision ID: 0003_citizen_profile_fields
Revises: 0002_report_created_by_user
Create Date: 2026-06-29
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0003_citizen_profile_fields"
down_revision: str | None = "0002_report_created_by_user"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("cpf", sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column("phone", sa.String(length=40), nullable=True))
        batch_op.add_column(sa.Column("birth_date", sa.String(length=20), nullable=True))
        batch_op.create_index("ix_users_cpf", ["cpf"])

    with op.batch_alter_table("reports") as batch_op:
        batch_op.add_column(sa.Column("citizen_cpf", sa.String(length=20), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("reports") as batch_op:
        batch_op.drop_column("citizen_cpf")

    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_index("ix_users_cpf")
        batch_op.drop_column("birth_date")
        batch_op.drop_column("phone")
        batch_op.drop_column("cpf")
