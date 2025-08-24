"""make password_hash nullable

Revision ID: 639fab4ea874
Revises: 371c818bf0e8
Create Date: 2025-08-24 19:10:48.966080
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "639fab4ea874"
down_revision: Union[str, Sequence[str], None] = "371c818bf0e8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.String(length=255),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.String(length=255),
        nullable=False,
    )
