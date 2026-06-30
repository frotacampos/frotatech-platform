"""Add report photo urls

Revision ID: 0004_report_photo_urls
Revises: 0003_citizen_profile_fields
Create Date: 2026-06-29
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0004_report_photo_urls"
down_revision: str | None = "0003_citizen_profile_fields"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("reports") as batch_op:
        batch_op.add_column(sa.Column("photo_url", sa.String(length=500), nullable=True))
        batch_op.add_column(sa.Column("resolution_photo_url", sa.String(length=500), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("reports") as batch_op:
        batch_op.drop_column("resolution_photo_url")
        batch_op.drop_column("photo_url")
