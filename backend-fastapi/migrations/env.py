# migrations/env.py
import os
import sys
import logging
from pathlib import Path
from logging.config import fileConfig

from dotenv import load_dotenv
from alembic import context
from sqlalchemy import create_engine, pool

# --- paths ---
BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

from app.models import Base

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)
logger = logging.getLogger("alembic.env")

target_metadata = Base.metadata

load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    user = os.getenv("DB_USER")
    pwd  = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    name = os.getenv("DB_NAME")
    if user and pwd and name:
        DATABASE_URL = f"postgresql+psycopg2://{user}:{pwd}@{host}:{port}/{name}"
    else:
        raise RuntimeError(
            "Defina DATABASE_URL ou as variáveis DB_USER/DB_PASSWORD/DB_HOST/DB_PORT/DB_NAME."
        )

config.set_main_option("sqlalchemy.url", DATABASE_URL)

def run_migrations_offline():
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
    def process_revision_directives(ctx, revision, directives):
        if getattr(config.cmd_opts, "autogenerate", False):
            script = directives[0]
            if script.upgrade_ops.is_empty():
                directives[:] = []
                logger.info("No changes in schema detected.")

    connectable = create_engine(DATABASE_URL, poolclass=pool.NullPool, future=True)
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
