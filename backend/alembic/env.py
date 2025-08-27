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
from app.models import Base                 # declarative_base com metadata
from app.config import settings as app_settings

def build_sync_db_url() -> str:
    """Monta a URL a partir do settings caso não tenha env explícito"""
    url = getattr(app_settings, "DATABASE_URL", None)
    if url:
        return url
    user = app_settings.DB_USER
    pwd = app_settings.DB_PASSWORD
    host = app_settings.DB_HOST
    port = app_settings.DB_PORT
    name = app_settings.DB_NAME
    return f"postgresql+psycopg2://{user}:{pwd}@{host}:{port}/{name}"

def normalize_to_sync(url: str) -> str:
    """Converte URL async para sync se necessário"""
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
    return url

# --- escolher URL síncrona para o Alembic ---
env_sync = os.getenv("DATABASE_URL_SYNC")
if env_sync:
    DATABASE_URL = env_sync
else:
    env_any = os.getenv("DATABASE_URL")
    if env_any:
        DATABASE_URL = normalize_to_sync(env_any)
    else:
        DATABASE_URL = normalize_to_sync(build_sync_db_url())

# injeta a URL no Alembic
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Metadata para autogenerate
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
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
    """Run migrations in 'online' mode."""
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
