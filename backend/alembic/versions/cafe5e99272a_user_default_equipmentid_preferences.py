"""add users.default_equipment_id"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "cafe5e99272a"
down_revision: Union[str, Sequence[str], None] = "89e776a95d31"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("default_equipment_id", sa.Integer(), nullable=True),
    )

    op.create_foreign_key(
        "fk_users_default_equipment",
        source_table="users",
        referent_table="equipments",
        local_cols=["default_equipment_id"],
        remote_cols=["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_users_default_equipment", "users", type_="foreignkey")
    op.drop_column("users", "default_equipment_id")
