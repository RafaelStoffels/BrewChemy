"""fix attenuation data type only

Revision ID: 4ccfba62e740
Revises: cafe5e99272a
Create Date: 2025-09-09 21:27:39.874295
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "4ccfba62e740"
down_revision: Union[str, Sequence[str], None] = "cafe5e99272a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Converte VARCHAR -> NUMERIC(5,2) sem subquery:
    # - NULL/'' -> NULL
    # - extrai o primeiro número (aceita vírgula/ponto e %), troca ',' por '.'
    op.execute(r"""
        ALTER TABLE recipe_yeasts
        ALTER COLUMN attenuation TYPE numeric(5,2)
        USING (
            CASE
                WHEN attenuation IS NULL OR btrim(attenuation) = '' THEN NULL
                WHEN attenuation ~ '[-+]?[0-9]+([.,][0-9]+)?'
                    THEN replace(
                           regexp_replace(
                               attenuation,
                               '^.*?([-+]?[0-9]+(?:[.,][0-9]+)?).*$',
                               '\1'
                           ),
                           ',', '.'
                         )::numeric
                ELSE NULL
            END
        )
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE recipe_yeasts
        ALTER COLUMN attenuation TYPE varchar(20)
        USING attenuation::text
    """)
