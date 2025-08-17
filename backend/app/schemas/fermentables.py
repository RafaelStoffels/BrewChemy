# app/schemas/fermentables.py
from pydantic import BaseModel, Field
from typing import Optional


class FermentableCreate(BaseModel):
    name: str
    description: Optional[str] = None
    ebc: Optional[float] = None
    potential_extract: float = Field(alias="potentialExtract")
    type: str
    supplier: Optional[str] = None
    official_id: Optional[int] = Field(default=None, alias="officialId")

    model_config = {"populate_by_name": True}


class FermentableUpdate(BaseModel):
    itemUserId: int
    name: Optional[str] = None
    description: Optional[str] = None
    ebc: Optional[float] = None
    potential_extract: Optional[float] = Field(default=None, alias="potentialExtract")
    type: Optional[str] = None
    supplier: Optional[str] = None

    model_config = {"populate_by_name": True}


class FermentableOut(BaseModel):
    id: int
    official_id: Optional[int] = Field(default=None, serialization_alias="officialId")
    user_id: int = Field(serialization_alias="userId")
    name: str
    description: Optional[str] = None
    ebc: Optional[float] = None
    potential_extract: float = Field(serialization_alias="potentialExtract")
    type: str
    supplier: Optional[str] = None

    model_config = {"from_attributes": True}
