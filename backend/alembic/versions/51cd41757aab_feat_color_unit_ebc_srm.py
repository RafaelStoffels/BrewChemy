"""feat color unit (ebc/srm)

Revision ID: 51cd41757aab
Revises: 4ccfba62e740
Create Date: 2025-09-11 17:01:10.370340
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "51cd41757aab"
down_revision: Union[str, Sequence[str], None] = "4ccfba62e740"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "users",
        sa.Column("color_unit", sa.String(length=5), nullable=False, server_default="EBC"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "color_unit")
