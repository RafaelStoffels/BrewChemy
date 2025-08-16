# app/scripts/seed.py

from datetime import datetime, timezone

from passlib.hash import argon2  # use o mesmo hash da sua app
from sqlalchemy import select

# ⬅️ ajuste estes imports conforme sua estrutura
# Base e User devem vir do módulo onde você define seus modelos
from app.models import User
# SessionLocal deve vir do módulo que cria o engine/sessionmaker
from app.database import SessionLocal

ADMIN_EMAIL = "adm@brewchemy.com"
ADMIN_NAME = "Adm"
ADMIN_PASSWORD_PLAINTEXT = "troque-esta-senha"  # Troque por algo forte (ou leia de env)

def run():
    session = SessionLocal()
    try:
        # verifica se já existe
        exists = session.execute(
            select(User).where(User.email == ADMIN_EMAIL)
        ).scalar_one_or_none()

        if exists:
            print("Adm user already exists.")
            return

        # gere o hash conforme sua política (argon2 aqui)
        password_hash = argon2.hash(ADMIN_PASSWORD_PLAINTEXT)

        admin = User(
            # NÃO force user_id=1 → deixe autoincrementar
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
        session.commit()
        print("Adm user created.")
    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    run()
