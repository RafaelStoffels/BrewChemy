# app/security.py
from passlib.context import CryptContext

pwd_ctx = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    # memory_cost em KiB → 65536 = 64 MiB
    argon2__memory_cost=65536,
    argon2__time_cost=2,
    argon2__parallelism=2,
)


def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)
