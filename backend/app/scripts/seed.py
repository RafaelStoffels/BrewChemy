# app/scripts/seed.py
import asyncio
from datetime import datetime, timezone
from passlib.hash import argon2
from sqlalchemy import select

from app.models import User
from app.database import SessionLocal

ADMIN_EMAIL = "adm@brewchemy.com"
ADMIN_NAME = "Adm"
ADMIN_PASSWORD_HASH = "$argon2id$v=19$m=65536,t=3,p=4$WEvJeW+tVSqFEKKUcg7hvA$17URKNQHd1Gw2sZ5AJJIgGfTxspwoI4lfJe0lYXtfWk"

async def run_async():
    session = SessionLocal()
    try:
        exists = await session.execute(
            select(User).where(User.email == ADMIN_EMAIL)
        )
        exists = exists.scalar_one_or_none()

        if exists:
            print("Adm user already exists.")
            return

        password_hash = ADMIN_PASSWORD_HASH

        admin = User(
            name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            password_hash=password_hash,
            brewery="",
            created_at=datetime.now(timezone.utc),
            last_login=None,
            is_active=True,
            google_id=None,
            status="active",
        )

        session.add(admin)
        await session.commit()
        print("Adm user created.")
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()

if __name__ == "__main__":
    asyncio.run(run_async())
