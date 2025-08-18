# app/schemas/recipes.py
from __future__ import annotations

from typing import Optional, List
from pydantic import BaseModel, Field, AliasChoices, model_validator
from datetime import date


# --- util: convert ""
def _blank_to_none(x):
    if isinstance(x, str) and x.strip() == "":
        return None
    if isinstance(x, list):
        return [_blank_to_none(i) for i in x]
    if isinstance(x, dict):
        return {k: _blank_to_none(v) for k, v in x.items()}
    return x


# ---------- children IN (CREATE) ----------
class RecipeEquipmentIn(BaseModel):
    name: str
    description: Optional[str] = None
    efficiency: float
    batchVolume: float = Field(
        validation_alias=AliasChoices("batchVolume", "batch_volume")
    )
    boilTime: int = Field(validation_alias=AliasChoices("boilTime", "boil_time"))
    boilTemperature: float = Field(
        validation_alias=AliasChoices("boilTemperature", "boil_temperature")
    )
    batchTime: Optional[int] = Field(
        default=None, validation_alias=AliasChoices("batchTime", "batch_time")
    )
    boilOff: Optional[float] = Field(
        default=None, validation_alias=AliasChoices("boilOff", "boil_off")
    )
    deadSpace: Optional[float] = Field(
        default=None, validation_alias=AliasChoices("deadSpace", "dead_space")
    )
    trubLoss: Optional[float] = Field(
        default=None, validation_alias=AliasChoices("trubLoss", "trub_loss")
    )

    model_config = {"extra": "ignore"}

    @model_validator(mode="before")
    @classmethod
    def _clean(cls, data):
        return _blank_to_none(data)


class RecipeFermentableIn(BaseModel):
    name: str
    description: Optional[str] = None
    ebc: float
    potentialExtract: float = Field(
        validation_alias=AliasChoices("potentialExtract", "potential_extract")
    )
    type: Optional[str] = None
    supplier: Optional[str] = None
    unitPrice: Optional[float] = Field(
        default=None, validation_alias=AliasChoices("unitPrice", "unit_price")
    )
    quantity: float

    model_config = {"extra": "ignore"}

    @model_validator(mode="before")
    @classmethod
    def _clean(cls, data):
        return _blank_to_none(data)


class RecipeHopIn(BaseModel):
    name: str
    alphaAcidContent: Optional[float] = Field(
        default=None,
        validation_alias=AliasChoices("alphaAcidContent", "alpha_acid_content"),
    )
    betaAcidContent: Optional[float] = Field(
        default=None,
        validation_alias=AliasChoices("betaAcidContent", "beta_acid_content"),
    )
    useType: Optional[str] = Field(
        default=None, validation_alias=AliasChoices("useType", "use_type")
    )
    countryOfOrigin: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("countryOfOrigin", "country_of_origin"),
    )
    description: Optional[str] = None
    quantity: float
    boilTime: Optional[int] = Field(
        default=None, validation_alias=AliasChoices("boilTime", "boil_time")
    )
    usageStage: Optional[str] = Field(
        default=None, validation_alias=AliasChoices("usageStage", "usage_stage")
    )

    model_config = {"extra": "ignore"}

    @model_validator(mode="before")
    @classmethod
    def _clean(cls, data):
        return _blank_to_none(data)


class RecipeMiscIn(BaseModel):
    name: str
    description: Optional[str] = None
    type: Optional[str] = None
    quantity: float
    use: Optional[str] = None
    time: Optional[int] = None

    model_config = {"extra": "ignore"}

    @model_validator(mode="before")
    @classmethod
    def _clean(cls, data):
        return _blank_to_none(data)


class RecipeYeastIn(BaseModel):
    name: str
    manufacturer: Optional[str] = None
    type: Optional[str] = None
    form: Optional[str] = None
    attenuation: Optional[str] = None
    temperatureRange: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("temperatureRange", "temperature_range"),
    )
    flavorProfile: Optional[str] = Field(
        default=None, validation_alias=AliasChoices("flavorProfile", "flavor_profile")
    )
    flocculation: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[float] = None

    model_config = {"extra": "ignore"}

    @model_validator(mode="before")
    @classmethod
    def _clean(cls, data):
        return _blank_to_none(data)


# ---------- children IN (UPDATE) ----------
class RecipeFermentableUpdateIn(RecipeFermentableIn):
    id: Optional[int] = None


class RecipeHopUpdateIn(RecipeHopIn):
    id: Optional[int] = None


class RecipeMiscUpdateIn(RecipeMiscIn):
    id: Optional[int] = None


class RecipeYeastUpdateIn(RecipeYeastIn):
    id: Optional[int] = None


# ---------- top-level IN ----------
class RecipeCreate(BaseModel):
    name: str
    style: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    author: Optional[str] = None
    type: str

    recipeEquipment: Optional[RecipeEquipmentIn] = Field(
        default=None,
        validation_alias=AliasChoices("recipeEquipment", "recipe_equipment"),
    )
    recipeFermentables: Optional[List[RecipeFermentableIn]] = Field(
        default=None,
        validation_alias=AliasChoices("recipeFermentables", "recipe_fermentables"),
    )
    recipeHops: Optional[List[RecipeHopIn]] = Field(
        default=None, validation_alias=AliasChoices("recipeHops", "recipe_hops")
    )
    recipeMisc: Optional[List[RecipeMiscIn]] = Field(
        default=None, validation_alias=AliasChoices("recipeMisc", "recipe_misc")
    )
    recipeYeasts: Optional[List[RecipeYeastIn]] = Field(
        default=None, validation_alias=AliasChoices("recipeYeasts", "recipe_yeasts")
    )

    model_config = {"extra": "ignore"}

    @model_validator(mode="before")
    @classmethod
    def _clean(cls, data):
        return _blank_to_none(data)


class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    style: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    author: Optional[str] = None
    type: Optional[str] = None

    recipeEquipment: Optional[RecipeEquipmentIn] = Field(
        default=None,
        validation_alias=AliasChoices("recipeEquipment", "recipe_equipment"),
    )
    recipeFermentables: Optional[List[RecipeFermentableUpdateIn]] = (
        Field(  # <-- usa UpdateIn (com id opcional)
            default=None,
            validation_alias=AliasChoices("recipeFermentables", "recipe_fermentables"),
        )
    )
    recipeHops: Optional[List[RecipeHopUpdateIn]] = Field(
        default=None, validation_alias=AliasChoices("recipeHops", "recipe_hops")
    )
    recipeMisc: Optional[List[RecipeMiscUpdateIn]] = Field(
        default=None, validation_alias=AliasChoices("recipeMisc", "recipe_misc")
    )
    recipeYeasts: Optional[List[RecipeYeastUpdateIn]] = Field(
        default=None, validation_alias=AliasChoices("recipeYeasts", "recipe_yeasts")
    )

    model_config = {"extra": "ignore"}

    @model_validator(mode="before")
    @classmethod
    def _clean(cls, data):
        return _blank_to_none(data)


# ---------- children OUT ----------
class RecipeEquipmentOut(BaseModel):
    id: int
    user_id: int = Field(serialization_alias="userId")
    recipe_id: int = Field(serialization_alias="recipeId")
    name: str
    description: Optional[str] = None
    efficiency: float
    batch_volume: float = Field(serialization_alias="batchVolume")
    boil_time: int = Field(serialization_alias="boilTime")
    boil_temperature: float = Field(serialization_alias="boilTemperature")
    batch_time: Optional[int] = Field(default=None, serialization_alias="batchTime")
    boil_off: Optional[float] = Field(default=None, serialization_alias="boilOff")
    dead_space: Optional[float] = Field(default=None, serialization_alias="deadSpace")
    trub_loss: Optional[float] = Field(default=None, serialization_alias="trubLoss")

    model_config = {"from_attributes": True}


class RecipeFermentableOut(BaseModel):
    id: int
    user_id: int = Field(serialization_alias="userId")
    recipe_id: int = Field(serialization_alias="recipeId")
    name: str
    description: Optional[str] = None
    ebc: float
    potential_extract: float = Field(serialization_alias="potentialExtract")
    type: Optional[str] = None
    supplier: Optional[str] = None
    unit_price: Optional[float] = Field(default=None, serialization_alias="unitPrice")
    quantity: Optional[float] = None

    model_config = {"from_attributes": True}


class RecipeHopOut(BaseModel):
    id: int
    user_id: int = Field(serialization_alias="userId")
    recipe_id: int = Field(serialization_alias="recipeId")
    name: str
    alpha_acid_content: Optional[float] = Field(
        default=None, serialization_alias="alphaAcidContent"
    )
    beta_acid_content: Optional[float] = Field(
        default=None, serialization_alias="betaAcidContent"
    )
    use_type: Optional[str] = Field(default=None, serialization_alias="useType")
    country_of_origin: Optional[str] = Field(
        default=None, serialization_alias="countryOfOrigin"
    )
    description: Optional[str] = None
    quantity: Optional[float] = None
    boil_time: Optional[int] = Field(default=None, serialization_alias="boilTime")
    usage_stage: Optional[str] = Field(default=None, serialization_alias="usageStage")

    model_config = {"from_attributes": True}


class RecipeMiscOut(BaseModel):
    id: int
    user_id: int = Field(serialization_alias="userId")
    recipe_id: int = Field(serialization_alias="recipeId")
    name: str
    description: Optional[str] = None
    type: Optional[str] = None
    quantity: Optional[float] = None
    use: Optional[str] = None
    time: Optional[int] = None

    model_config = {"from_attributes": True}


class RecipeYeastOut(BaseModel):
    id: int
    user_id: int = Field(serialization_alias="userId")
    recipe_id: int = Field(serialization_alias="recipeId")
    name: str
    manufacturer: Optional[str] = None
    type: Optional[str] = None
    form: Optional[str] = None
    attenuation: Optional[str] = None
    temperature_range: Optional[str] = Field(
        default=None, serialization_alias="temperatureRange"
    )
    flavor_profile: Optional[str] = Field(
        default=None, serialization_alias="flavorProfile"
    )
    flocculation: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[float] = None

    model_config = {"from_attributes": True}


# ---------- top-level OUT ----------
class RecipeOut(BaseModel):
    id: int
    user_id: int = Field(serialization_alias="userId")
    name: str
    style: Optional[str] = None
    description: Optional[str] = None
    creation_date: Optional[date] = Field(
        default=None, serialization_alias="creationDate"
    )
    notes: Optional[str] = None
    author: str
    type: str

    recipe_equipment: Optional[RecipeEquipmentOut] = Field(
        default=None, serialization_alias="recipeEquipment"
    )
    recipe_fermentables: List[RecipeFermentableOut] = Field(
        default_factory=list, serialization_alias="recipeFermentables"
    )
    recipe_hops: List[RecipeHopOut] = Field(
        default_factory=list, serialization_alias="recipeHops"
    )
    recipe_misc: List[RecipeMiscOut] = Field(
        default_factory=list, serialization_alias="recipeMisc"
    )
    recipe_yeasts: List[RecipeYeastOut] = Field(
        default_factory=list, serialization_alias="recipeYeasts"
    )

    model_config = {"from_attributes": True}
