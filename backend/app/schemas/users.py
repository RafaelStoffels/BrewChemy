from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class CreateUserIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    brewery: Optional[str] = None


class UserOut(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    brewery: Optional[str] = None
    status: str
    weight_unit: str | None = None
    volume_unit: str | None = None
    default_equipment_id: int | None = None

    class Config:
        from_attributes = True
