# app/models.py
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import (
    Integer,
    String,
    Text,
    Numeric,
    DateTime,
    Boolean,
    ForeignKey,
    Date,
    func,
)

from passlib.context import CryptContext


class Base(DeclarativeBase):
    pass


pwd_ctx = CryptContext(
    schemes=["argon2"],  # Argon2id
    deprecated="auto",
    argon2__memory_cost=65536,  # 64 MiB
    argon2__time_cost=2,
    argon2__parallelism=2,
)


class User(Base):
    __tablename__ = "users"
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp()
    )
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[Optional[bool]] = mapped_column(Boolean)
    brewery: Mapped[Optional[str]] = mapped_column(String(60))
    google_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True)
    status: Mapped[Optional[str]] = mapped_column(String(15))
    weight_unit: Mapped[str] = mapped_column(String(5), default="g")
    volume_unit: Mapped[str] = mapped_column(String(5), default="l")

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
            "volumeUnit": self.volume_unit,
        }


class Equipment(Base):
    __tablename__ = "equipments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    official_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    efficiency: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    batch_volume: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    batch_time: Mapped[int | None] = mapped_column(Integer, nullable=True)
    boil_time: Mapped[int | None] = mapped_column(Integer, nullable=True)
    boil_temperature: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    boil_off: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    trub_loss: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    dead_space: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )


class Fermentable(Base):
    __tablename__ = "fermentables"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    official_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(40), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    ebc: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    potential_extract: Mapped[float] = mapped_column(Numeric(5, 3), nullable=False)
    type: Mapped[str] = mapped_column(String(15), nullable=False)
    stock_quantity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    supplier: Mapped[str | None] = mapped_column(String(40), nullable=True)
    unit_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)


class Hop(Base):
    __tablename__ = "hops"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    official_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(40), nullable=False)
    supplier: Mapped[str | None] = mapped_column(String(40), nullable=True)
    alpha_acid_content: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True
    )
    beta_acid_content: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True
    )
    type: Mapped[str | None] = mapped_column(String(15), nullable=True)
    country_of_origin: Mapped[str | None] = mapped_column(String(50), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    use_type: Mapped[str | None] = mapped_column(String(15), nullable=True)


class Misc(Base):
    __tablename__ = "misc"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    official_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(40), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[str | None] = mapped_column(String(15), nullable=True)


class Yeast(Base):
    __tablename__ = "yeasts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    official_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(40), nullable=False)
    manufacturer: Mapped[str | None] = mapped_column(String(60), nullable=True)
    type: Mapped[str | None] = mapped_column(String(15), nullable=True)
    form: Mapped[str | None] = mapped_column(String(15), nullable=True)
    attenuation: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    temperature_range: Mapped[str | None] = mapped_column(String(15), nullable=True)
    flavor_profile: Mapped[str | None] = mapped_column(String(100), nullable=True)
    flocculation: Mapped[str | None] = mapped_column(String(15), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class Recipe(Base):
    __tablename__ = "recipes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False, index=True
    )

    name: Mapped[str] = mapped_column(String(40), nullable=False)
    style: Mapped[str | None] = mapped_column(String(30), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    creation_date: Mapped[object] = mapped_column(
        Date, server_default=func.current_date()
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    author: Mapped[str] = mapped_column(String(40), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)

    recipe_equipment: Mapped["RecipeEquipment | None"] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
        uselist=False,
        lazy="selectin",
    )
    recipe_fermentables: Mapped[list["RecipeFermentable"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan", lazy="selectin"
    )
    recipe_hops: Mapped[list["RecipeHop"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan", lazy="selectin"
    )
    recipe_misc: Mapped[list["RecipeMisc"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan", lazy="selectin"
    )
    recipe_yeasts: Mapped[list["RecipeYeast"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan", lazy="selectin"
    )


class RecipeEquipment(Base):
    __tablename__ = "recipe_equipment"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False, index=True
    )
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    efficiency: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    batch_volume: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    boil_time: Mapped[int] = mapped_column(Integer, nullable=False)
    boil_temperature: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    batch_time: Mapped[int | None] = mapped_column(Integer)
    boil_off: Mapped[float | None] = mapped_column(Numeric(5, 2))
    dead_space: Mapped[float | None] = mapped_column(Numeric(5, 2))
    trub_loss: Mapped[float | None] = mapped_column(Numeric(5, 2))
    recipe: Mapped["Recipe"] = relationship(back_populates="recipe_equipment")


class RecipeFermentable(Base):
    __tablename__ = "recipe_fermentables"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False, index=True
    )
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(40), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    ebc: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    potential_extract: Mapped[float] = mapped_column(Numeric(5, 3), nullable=False)
    type: Mapped[str | None] = mapped_column(String(15))
    supplier: Mapped[str | None] = mapped_column(String(40))
    unit_price: Mapped[float | None] = mapped_column(Numeric(10, 2))
    quantity: Mapped[float] = mapped_column(Numeric, nullable=False)
    recipe: Mapped["Recipe"] = relationship(back_populates="recipe_fermentables")


class RecipeHop(Base):
    __tablename__ = "recipe_hops"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False, index=True
    )
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(40), nullable=False)
    alpha_acid_content: Mapped[float | None] = mapped_column(Numeric(5, 2))
    beta_acid_content: Mapped[float | None] = mapped_column(Numeric(5, 2))
    use_type: Mapped[str | None] = mapped_column(String(15))
    country_of_origin: Mapped[str | None] = mapped_column(String(50))
    description: Mapped[str | None] = mapped_column(Text)
    quantity: Mapped[float] = mapped_column(Numeric, nullable=False)
    boil_time: Mapped[int | None] = mapped_column(Integer)
    usage_stage: Mapped[str | None] = mapped_column(String(15))
    recipe: Mapped["Recipe"] = relationship(back_populates="recipe_hops")


class RecipeMisc(Base):
    __tablename__ = "recipe_misc"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False, index=True
    )
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(40), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    type: Mapped[str | None] = mapped_column(String(15))
    quantity: Mapped[float] = mapped_column(Numeric, nullable=False)
    use: Mapped[str | None] = mapped_column(String(15))
    time: Mapped[int | None] = mapped_column(Integer)
    recipe: Mapped["Recipe"] = relationship(back_populates="recipe_misc")


class RecipeYeast(Base):
    __tablename__ = "recipe_yeasts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False, index=True
    )
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(40), nullable=False)
    manufacturer: Mapped[str | None] = mapped_column(String(100))
    type: Mapped[str | None] = mapped_column(String(15))
    form: Mapped[str | None] = mapped_column(String(15))
    attenuation: Mapped[str | None] = mapped_column(String(20))
    temperature_range: Mapped[str | None] = mapped_column(String(15))
    flavor_profile: Mapped[str | None] = mapped_column(Text)
    flocculation: Mapped[str | None] = mapped_column(String(15))
    description: Mapped[str | None] = mapped_column(Text)
    quantity: Mapped[float] = mapped_column(Numeric, nullable=False)
    recipe: Mapped["Recipe"] = relationship(back_populates="recipe_yeasts")
