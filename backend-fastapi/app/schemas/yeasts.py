# app/schemas/yeasts.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional

def _empty_str_to_none(v):
    if isinstance(v, str) and v.strip() == "":
        return None
    return v

class YeastCreate(BaseModel):
    name: str
    manufacturer: Optional[str] = None
    type: Optional[str] = None
    form: Optional[str] = None
    attenuation: Optional[float] = None
    temperature_range: Optional[str] = Field(default=None, alias="temperatureRange")
    flavor_profile: Optional[str] = Field(default=None, alias="flavorProfile")
    flocculation: Optional[str] = None
    description: Optional[str] = None
    official_id: Optional[int] = Field(default=None, alias="officialId")

    @field_validator(
        "manufacturer", "type", "form", "attenuation",
        "temperature_range", "flavor_profile", "flocculation", "description",
        mode="before",
    )
    @classmethod
    def _sanitize(cls, v):  # noqa: N805
        return _empty_str_to_none(v)

    model_config = {"populate_by_name": True}

class YeastUpdate(BaseModel):
    itemUserId: int
    name: Optional[str] = None
    manufacturer: Optional[str] = None
    type: Optional[str] = None
    form: Optional[str] = None
    attenuation: Optional[float] = None
    temperature_range: Optional[str] = Field(default=None, alias="temperatureRange")
    flavor_profile: Optional[str] = Field(default=None, alias="flavorProfile")
    flocculation: Optional[str] = None
    description: Optional[str] = None

    @field_validator(
        "name", "manufacturer", "type", "form", "attenuation",
        "temperature_range", "flavor_profile", "flocculation", "description",
        mode="before",
    )
    @classmethod
    def _sanitize(cls, v):  # noqa: N805
        return _empty_str_to_none(v)

    model_config = {"populate_by_name": True}

class YeastOut(BaseModel):
    id: int
    official_id: Optional[int] = Field(default=None, serialization_alias="officialId")
    user_id: int = Field(serialization_alias="userId")
    name: str
    manufacturer: Optional[str] = None
    type: Optional[str] = None
    form: Optional[str] = None
    attenuation: Optional[float] = None
    temperature_range: Optional[str] = Field(default=None, serialization_alias="temperatureRange")
    flavor_profile: Optional[str] = Field(default=None, serialization_alias="flavorProfile")
    flocculation: Optional[str] = None
    description: Optional[str] = None

    model_config = {"from_attributes": True}
