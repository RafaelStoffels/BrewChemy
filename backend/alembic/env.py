from __future__ import annotations
from logging.config import fileConfig
from pathlib import Path
import os
import sys

from sqlalchemy import engine_from_config, pool
from alembic import context

BASE_DIR = Path(__file__).resolve().parents[1]  # .../backend
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from app.models import Base
from app.config import settings as app_settings

def normalize_scheme(url: str) -> str:
    """Normaliza 'postgres://' -> 'postgresql://' para o SQLAlchemy."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url

def to_sync_psycopg2(url: str) -> str:
    """
    Converte qualquer URL Postgres para driver síncrono psycopg2:
    - postgresql+asyncpg://... -> postgresql+psycopg2://...
    - postgresql://... (já é psycopg2 por padrão)
    """
    url = normalize_scheme(url)
    if url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
    return url

def build_sync_db_url_from_settings() -> str:
    """Monta a URL a partir do settings caso não tenha env explícito."""
    url = getattr(app_settings, "DATABASE_URL", None) or ""
    if url:
        return to_sync_psycopg2(url)
    user = app_settings.DB_USER
    pwd  = app_settings.DB_PASSWORD
    host = app_settings.DB_HOST
    port = app_settings.DB_PORT
    name = app_settings.DB_NAME
    return f"postgresql+psycopg2://{user}:{pwd}@{host}:{port}/{name}"

def get_alembic_sync_url() -> str:
    raw = os.getenv("DATABASE_URL")
    if raw:
        return to_sync_psycopg2(raw)

    raw_async = os.getenv("DATABASE_URL_SYNC")
    if raw_async:
        return to_sync_psycopg2(raw_async)

    return build_sync_db_url_from_settings()

DATABASE_URL = get_alembic_sync_url()
config.set_main_option("sqlalchemy.url", DATABASE_URL)

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
