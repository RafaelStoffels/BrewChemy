# app/models.py
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, DateTime, Boolean, func

from passlib.context import CryptContext
from .database import Base

pwd_ctx = CryptContext(
    schemes=["argon2"],              # Argon2id
    deprecated="auto",
    argon2__memory_cost=65536,       # 64 MiB
    argon2__time_cost=2,
    argon2__parallelism=2,
)

class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp())
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[Optional[bool]] = mapped_column(Boolean)
    brewery: Mapped[Optional[str]] = mapped_column(String(60))
    google_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True)
    status: Mapped[Optional[str]] = mapped_column(String(15))
    weight_unit: Mapped[str] = mapped_column(String(5), default="g")

    # ---- helpers com Argon2id ----
    def set_password(self, password: str) -> None:
        self.password_hash = pwd_ctx.hash(password)

    def check_password(self, password: str) -> bool:
        return pwd_ctx.verify(password, self.password_hash)

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "google_id": self.google_id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at,
            "last_login": self.last_login,
            "is_active": self.is_active,
            "brewery": self.brewery,
            "status": self.status,
            "weightUnit": self.weight_unit,
        }
