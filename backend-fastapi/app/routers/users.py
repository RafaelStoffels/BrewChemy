# app/routers/users.py
from datetime import datetime, timezone, timedelta
import random
import smtplib
from email.message import EmailMessage

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Query, status, Request
from fastapi.responses import JSONResponse, RedirectResponse
from jose import jwt, JWTError, ExpiredSignatureError
from pydantic import BaseModel, EmailStr, Field, AliasChoices
from sqlalchemy import select
from sqlalchemy.orm import Session
from requests_oauthlib import OAuth2Session

from ..config import settings
from ..database import get_db
from ..models import User
from ..schemas.users import CreateUserIn, LoginIn, UserOut
from ..security import verify_password, hash_password
from ..utils.jwt import make_access_token

router = APIRouter(prefix="/api/users", tags=["users"])

def token_required(authorization: str | None = Header(None)) -> int:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALG],
            options={"verify_aud": False},
        )
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if payload.get("typ") != "access" or payload.get("iss") != "brewchemy":
        raise HTTPException(status_code=401, detail="Invalid token")

    sub = payload.get("sub")
    if not sub or not sub.isdigit():
        raise HTTPException(status_code=401, detail="Invalid token subject")

    return int(sub)


class MeOut(BaseModel):
    user_id: int
    name: str
    email: str
    weightUnit: str | None = None

    class Config:
        from_attributes = True


def get_current_user(
    user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if getattr(user, "status", "active") != "active":
        raise HTTPException(status_code=403, detail="User is not active")
    return user


@router.get("/google/login")
def google_login(request: Request):
    google = OAuth2Session(
        settings.GOOGLE_CLIENT_ID,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
        scope=["openid", "email", "profile"],
    )
    authorization_url, state = google.authorization_url(
        settings.GOOGLE_AUTH_URL,
        access_type="offline",
        prompt="select_account",
    )

    request.session["oauth_state"] = state

    return RedirectResponse(authorization_url, status_code=302)


@router.get("/google/callback")
def google_callback(request: Request, db: Session = Depends(get_db)):
    state = request.query_params.get("state")
    saved_state = request.session.get("oauth_state")
    if not state or not saved_state or state != saved_state:
        raise HTTPException(status_code=400, detail="Invalid state")

    google = OAuth2Session(
        settings.GOOGLE_CLIENT_ID,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
        state=saved_state,
    )

    try:
        token = google.fetch_token(
            settings.GOOGLE_TOKEN_URL,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            authorization_response=str(request.url),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {e}")

    request.session["oauth_token"] = token

    try:
        user_info = google.get("https://www.googleapis.com/oauth2/v3/userinfo").json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch userinfo: {e}")

    google_id = user_info.get("sub")
    email = user_info.get("email")
    name = user_info.get("name")

    if not google_id or not email:
        raise HTTPException(status_code=400, detail="Missing Google user data")

    user = (
        db.query(User)
        .filter((User.email == email) | (User.google_id == google_id))
        .first()
    )

    try:
        if not user:
            temp_password = _generate_temp_password()

            user = User(
                name=name or email.split("@")[0],
                email=email,
                google_id=google_id,
                password_hash=hash_password(temp_password),  # Argon2
                brewery=None,
                status="active",
                last_login=datetime.now(timezone.utc),
            )

            db.add(user)
            db.commit()
            db.refresh(user)

        else:
            if getattr(user, "status", "active") == "pending":
                user.status = "active"

            if not getattr(user, "google_id", None):
                user.google_id = google_id

            user.last_login = datetime.now(timezone.utc)
            db.commit()

    except Exception:
        db.rollback()
        raise

    token = make_access_token(user.user_id)

    return RedirectResponse(url=f"{settings.FRONTEND_URL}/?token={token}", status_code=302)


def _generate_temp_password(length: int = 16) -> str:
    import secrets
    import string
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    user = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()

    if not user or user.status != "active" or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    token = make_access_token(user.user_id)
    return {"token": token}


@router.get("/me", response_model=MeOut)
def get_user_me(current_user: User = Depends(get_current_user)):
    return MeOut(
        user_id=current_user.user_id,
        name=current_user.name,
        email=current_user.email,
        weightUnit=getattr(current_user, "weight_unit", None),
    )


@router.post("", status_code=status.HTTP_201_CREATED, response_model=UserOut)
def create_user(payload: CreateUserIn, background: BackgroundTasks, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")

    pwd_hash = hash_password(payload.password)

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


class UpdateUserIn(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=6)
    brewery: str | None = None
    is_active: bool | None = None
    weight_unit: str | None = Field(default=None, validation_alias=AliasChoices("weightUnit", "weight_unit"))


@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, payload: UpdateUserIn, db: Session = Depends(get_db)):
    user: User | None = db.query(User).get(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.name is not None:
        user.name = payload.name
    if payload.email is not None:
        user.email = payload.email
    if payload.password:
        user.password_hash = hash_password(payload.password)
    if payload.brewery is not None:
        user.brewery = payload.brewery
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.weight_unit is not None:
        user.weight_unit = payload.weight_unit

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user: User | None = db.query(User).get(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted successfully"}


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
            f"{settings.BACKEND_URL}/api/users/confirm?email={user.email}\n\n"
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


@router.get("/confirm")
def confirm_user(
    email: EmailStr = Query(..., description="E-mail de confirmação"),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.status == "active":
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "User is already active"},
        )

    user.status = "active"
    db.commit()

    return RedirectResponse(url=settings.FRONTEND_URL, status_code=status.HTTP_302_FOUND)

class ChangePasswordIn(BaseModel):
    token: str
    password: str = Field(..., min_length=6)

@router.post("/changePassword")
def change_password(payload: ChangePasswordIn, db: Session = Depends(get_db)):
    if not payload.token:
        print("Token is required")
        raise HTTPException(status_code=400, detail="Token is required")

    try:
        decoded = jwt.decode(payload.token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        if decoded.get("typ") != "pwd_reset" or decoded.get("iss") != "brewchemy":
            print("Invalid token type")
            raise HTTPException(status_code=400, detail="Invalid token type")

        email = decoded.get("sub")
        if not email:
            print("Invalid token")
            raise HTTPException(status_code=400, detail="Invalid token")

        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.password_hash = hash_password(payload.password)
        db.commit()
        return {"message": "Password changed successfully"}

    except ExpiredSignatureError:
        print("ExpiredSignatureError")
        raise HTTPException(status_code=400, detail="Token has expired")
    except JWTError:
        print("JWTError")
        raise HTTPException(status_code=400, detail="Invalid token")
    
class PasswordResetRequest(BaseModel):
    email: EmailStr

@router.post("/sendPasswordResetEmail")
def send_password_reset_email(
    payload: PasswordResetRequest,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    email = payload.email

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        now = datetime.now(timezone.utc)
        token = jwt.encode(
            {
                "sub": email,
                "typ": "pwd_reset",
                "iat": int(now.timestamp()),
                "exp": int((now + timedelta(hours=1)).timestamp()),
            },
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALG
        )

        reset_link = f"{settings.FRONTEND_URL}/ChangePassword?token={token}"

        def send_email():
            msg = EmailMessage()
            msg["Subject"] = "Change Password"
            msg["From"] = settings.MAIL_DEFAULT_SENDER
            msg["To"] = email
            msg.set_content(
                "Click the link below to reset your password:\n"
                f"{reset_link}\n\n"
                "If you did not request this, please ignore this email.\n\n"
                "Best regards,\nThe Brewchemy Team"
            )

            use_tls = bool(getattr(settings, "MAIL_USE_TLS", True))
            server_port = int(settings.MAIL_PORT)

            if server_port == 465:
                server = smtplib.SMTP_SSL(settings.MAIL_SERVER, server_port, timeout=15)
            else:
                server = smtplib.SMTP(settings.MAIL_SERVER, server_port, timeout=15)

            try:
                if server_port != 465 and use_tls:
                    server.starttls()
                if getattr(settings, "MAIL_USERNAME", None) and getattr(settings, "MAIL_PASSWORD", None):
                    server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
                server.send_message(msg)
            finally:
                server.quit()

        background.add_task(send_email)

        return {"message": "Email sent successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
    