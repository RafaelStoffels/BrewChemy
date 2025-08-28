# app/database.py
import asyncio
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
    async_scoped_session,
)

from .config import settings


def to_async_url(url: str) -> str:
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if "+asyncpg" not in url:
        url = url.replace("postgresql+psycopg2", "postgresql+asyncpg").replace(
            "postgresql://", "postgresql+asyncpg://"
        )
    return url


ASYNC_DATABASE_URL = to_async_url(settings.DATABASE_URL)

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"statement_cache_size": 0},
)

_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    expire_on_commit=False,
)

SessionLocal = async_scoped_session(_session_factory, scopefunc=asyncio.current_task)


async def get_db() -> AsyncSession:
    db: AsyncSession = SessionLocal()
    try:
        yield db
    finally:
        await db.close()