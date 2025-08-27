# app/database.py
from __future__ import annotations

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.engine.url import make_url
from .config import settings


def _normalize_scheme(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def _force_asyncpg(url: str) -> str:

    url = _normalize_scheme(url)
    u = make_url(url)
    if u.drivername in ("postgres", "postgresql", "postgresql+psycopg2"):
        u = u.set(drivername="postgresql+asyncpg")
    return str(u)


raw_url = getattr(settings, "DATABASE_URL_SYNC", None) or getattr(settings, "DATABASE_URL", "")
ASYNC_DATABASE_URL = _force_asyncpg(raw_url)

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_pre_ping=True,
    future=True,
)

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    async with SessionLocal() as db:
        yield db
