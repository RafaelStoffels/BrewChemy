# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from passlib.hash import pbkdf2_sha256
import smtplib
from email.message import EmailMessage
from ..config import settings
import random

from ..database import get_db
from ..models import User
from ..schemas.users import LoginIn, CreateUserIn, UserOut
from ..config import settings

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or user.status != "active":
        raise HTTPException(status_code=401, detail="User account is not active or does not exist")

    if not pbkdf2_sha256.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    exp_ts = int((datetime.now(timezone.utc) + settings.JWT_EXPDELTA).timestamp())
    token = settings.jwt_encode({"user_id": user.user_id, "exp": exp_ts})

    return {"token": token}


@router.post("", status_code=status.HTTP_201_CREATED, response_model=UserOut)
def create_user(payload: CreateUserIn, background: BackgroundTasks, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")

    pwd_hash = pbkdf2_sha256.hash(payload.password)

    new_user = User(
        user_id=random.randint(1, 1_000_000),
        name=payload.name,
        email=payload.email,
        password_hash=pwd_hash,
        brewery=payload.brewery,
        status="pending",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    background.add_task(send_confirmation_email, new_user)

    return UserOut.from_orm(new_user)


def send_confirmation_email(user) -> bool:
    if not getattr(settings, "EMAIL_ENABLED", True):
        print("[email] EMAIL_ENABLED=False; pulando envio.")
        return False

    required = [settings.MAIL_SERVER, settings.MAIL_PORT, settings.MAIL_DEFAULT_SENDER]
    if not all(required):
        print("[email] Config incompleta: MAIL_SERVER/MAIL_PORT/MAIL_DEFAULT_SENDER ausentes.")
        return False

    try:
        msg = EmailMessage()
        msg["Subject"] = "Registration Confirmation"
        msg["From"] = settings.MAIL_DEFAULT_SENDER
        msg["To"] = user.email
        msg.set_content(
            f"Hello {user.name},\n\n"
            f"Click the link below to confirm your registration:\n"
            f"{settings.BACKEND_URL}/api/confirm?email={user.email}\n\n"
            "If you did not request this registration, please ignore this email.\n\n"
            "Best regards,\nThe Brewchemy Team"
        )

        use_tls = bool(getattr(settings, "MAIL_USE_TLS", True))
        server_host = settings.MAIL_SERVER
        server_port = int(settings.MAIL_PORT)

        if server_port == 465:
            print(f"[email] Conectando via SMTP_SSL {server_host}:{server_port}")
            server = smtplib.SMTP_SSL(server_host, server_port, timeout=15)
        else:
            print(f"[email] Conectando via SMTP {server_host}:{server_port}")
            server = smtplib.SMTP(server_host, server_port, timeout=15)

        try:
            server.set_debuglevel(1)
            if server_port != 465 and use_tls:
                print("[email] Iniciando STARTTLS...")
                server.starttls()

            if getattr(settings, "MAIL_USERNAME", None) and getattr(settings, "MAIL_PASSWORD", None):
                print(f"[email] Autenticando como {settings.MAIL_USERNAME!r}")
                server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)

            print("[email] Enviando mensagem...")
            server.send_message(msg)
            print("[email] OK")
            return True
        finally:
            server.quit()

    except Exception as e:
        print(f"[email] Falha ao enviar: {type(e).__name__}: {e}")
        return False