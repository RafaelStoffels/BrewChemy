import os
import sys
import logging
from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

# garante que o Alembic ache o pacote app/ mesmo rodando de fora
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.models import Base              # ajuste se seu Base estiver em outro lugar
from app.config import settings             # importa settings do Pydantic

# Config do Alembic
config = context.config

# Logging do Alembic
if config.config_file_name is not None:
    fileConfig(config.config_file_name)
logger = logging.getLogger("alembic.env")

# Metadados dos modelos (usados no autogenerate)
target_metadata = Base.metadata

# Database URL vem do config.py (pydantic settings)
DATABASE_URL = settings.DATABASE_URL


def run_migrations_offline():
    """Rodar migrations em modo offline (gera SQL sem conectar)."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Rodar migrations em modo online (conecta no banco)."""

    def process_revision_directives(ctx, revision, directives):
        # evita gerar migration vazia com --autogenerate
        if getattr(config.cmd_opts, "autogenerate", False):
            script = directives[0]
            if script.upgrade_ops.is_empty():
                directives[:] = []
                logger.info("No changes in schema detected.")

    connectable = create_engine(
        DATABASE_URL,
        poolclass=pool.NullPool,
        future=True,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            process_revision_directives=process_revision_directives,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
