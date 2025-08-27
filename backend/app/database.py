# app/database.py
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import scoped_session

from .config import settings

ASYNC_DATABASE_URL = settings.DATABASE_URL.replace("+psycopg2", "+asyncpg")

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_pre_ping=True,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    expire_on_commit=False,
)

SessionLocal = scoped_session(AsyncSessionLocal)

async def get_db() -> AsyncSession:
    db: AsyncSession = SessionLocal()
    try:
        yield db
    finally:
        await db.close()
