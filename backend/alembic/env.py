# alembic/env.py
from __future__ import annotations
from logging.config import fileConfig
from pathlib import Path
import os
import sys

from sqlalchemy import engine_from_config, pool
from alembic import context

# --- garantir import do pacote app ---
BASE_DIR = Path(__file__).resolve().parents[1]  # .../backend
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

# Logging do Alembic
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- importar Base e settings ---
from app.models import Base                 # <<< seu declarative_base
from app.config import settings as app_settings

def build_sync_db_url() -> str:
    # 1) se veio pronta no .env, usa
    url = app_settings.DATABASE_URL
    if url:
        # Se for async, converte para sync para o Alembic
        if url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
        return url

    # 2) montar a partir de DB_* (do seu config.py)
    user = app_settings.DB_USER
    pwd  = app_settings.DB_PASSWORD
    host = app_settings.DB_HOST
    port = app_settings.DB_PORT
    name = app_settings.DB_NAME
    return f"postgresql+psycopg2://{user}:{pwd}@{host}:{port}/{name}"

DATABASE_URL = build_sync_db_url()

# fallback por env (opcional)
DATABASE_URL = os.getenv("DATABASE_URL", DATABASE_URL)

# injeta a URL no Alembic
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# MUITO IMPORTANTE: metadata para autogenerate
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
