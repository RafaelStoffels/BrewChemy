# app/schemas/miscs.py
from pydantic import BaseModel, Field
from typing import Optional

class MiscCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: Optional[str] = None

class MiscUpdate(BaseModel):
    itemUserId: int
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None

class MiscOut(BaseModel):
    id: int
    official_id: Optional[int] = Field(default=None, serialization_alias="officialId")
    user_id: int = Field(serialization_alias="userId")
    name: str
    description: Optional[str] = None
    type: Optional[str] = None

    model_config = {"from_attributes": True}
