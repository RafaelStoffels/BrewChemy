# app/schemas/hops.py
from pydantic import BaseModel, Field
from typing import Optional


class HopCreate(BaseModel):
    name: str
    supplier: Optional[str] = None
    alpha_acid_content: Optional[float] = Field(default=None, alias="alphaAcidContent")
    beta_acid_content: Optional[float] = Field(default=None, alias="betaAcidContent")
    type: Optional[str] = None
    use_type: Optional[str] = Field(default=None, alias="useType")
    country_of_origin: Optional[str] = Field(default=None, alias="countryOfOrigin")
    description: Optional[str] = None
    official_id: Optional[int] = Field(default=None, alias="officialId")

    model_config = {"populate_by_name": True}


class HopUpdate(BaseModel):
    name: Optional[str] = None
    supplier: Optional[str] = None
    alpha_acid_content: Optional[float] = Field(default=None, alias="alphaAcidContent")
    beta_acid_content: Optional[float] = Field(default=None, alias="betaAcidContent")
    type: Optional[str] = None
    use_type: Optional[str] = Field(default=None, alias="useType")
    country_of_origin: Optional[str] = Field(default=None, alias="countryOfOrigin")
    description: Optional[str] = None

    model_config = {"populate_by_name": True}


class HopOut(BaseModel):
    id: int
    official_id: Optional[int] = Field(default=None, serialization_alias="officialId")
    user_id: int = Field(serialization_alias="userId")
    name: str
    supplier: Optional[str] = None
    alpha_acid_content: Optional[float] = Field(
        default=None, serialization_alias="alphaAcidContent"
    )
    beta_acid_content: Optional[float] = Field(
        default=None, serialization_alias="betaAcidContent"
    )
    type: Optional[str] = None
    use_type: Optional[str] = Field(default=None, serialization_alias="useType")
    country_of_origin: Optional[str] = Field(
        default=None, serialization_alias="countryOfOrigin"
    )
    description: Optional[str] = None

    model_config = {"from_attributes": True}
