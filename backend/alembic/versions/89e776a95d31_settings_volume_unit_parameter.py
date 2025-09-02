from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '89e776a95d31'
down_revision: Union[str, Sequence[str], None] = '639fab4ea874'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('volume_unit', sa.String(length=5), nullable=True)
    )

    op.execute("UPDATE users SET volume_unit = 'l' WHERE volume_unit IS NULL")

    op.alter_column('users', 'volume_unit', nullable=False)


def downgrade() -> None:
    op.drop_column('users', 'volume_unit')
