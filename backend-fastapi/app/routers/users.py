# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.hash import pbkdf2_sha256
from fastapi import HTTPException

from ..database import get_db
from ..models import User
from ..schemas.users import LoginIn
from ..config import settings

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    user = db.query(User).filter(User.email == payload.email).first()

    if not user.check_password(payload.password):
    # show message to hash different then argon2
        raise HTTPException(status_code=401, detail="Invalid password")

    if not user or user.status != "active":
        raise HTTPException(status_code=401, detail="User account is not active or does not exist")

    # password validation (hash Werkzeug PBKDF2-SHA256)
    if not pbkdf2_sha256.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    # jwt generate
    exp_ts = int((datetime.now(timezone.utc) + timedelta(hours=8)).timestamp())
    token = jwt.encode({"user_id": user.user_id, "exp": exp_ts}, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

    return {"token": token}
