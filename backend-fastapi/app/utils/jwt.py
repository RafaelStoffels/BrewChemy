# utils/jwt.py
from datetime import datetime, timezone, timedelta
from jose import jwt
from ..config import settings

def make_access_token(user_id: int, *, hours=1):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "typ": "access",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=hours)).timestamp()),
        "iss": "brewchemy",
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)