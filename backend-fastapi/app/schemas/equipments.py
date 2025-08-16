from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class EquipmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    efficiency: float
    batch_volume: float = Field(alias="batchVolume")
    batch_time: Optional[int] = Field(default=None, alias="batchTime")
    boil_time: Optional[int] = Field(default=None, alias="boilTime")
    boil_temperature: float = Field(alias="boilTemperature")
    boil_off: Optional[float] = Field(default=None, alias="boilOff")
    trub_loss: Optional[float] = Field(default=None, alias="trubLoss")
    dead_space: Optional[float] = Field(default=None, alias="deadSpace")

    model_config = {"populate_by_name": True}

class EquipmentUpdate(BaseModel):
    itemUserId: int
    name: Optional[str] = None
    description: Optional[str] = None
    efficiency: Optional[float] = None
    batch_volume: Optional[float] = Field(default=None, alias="batchVolume")
    batch_time: Optional[int] = Field(default=None, alias="batchTime")
    boil_time: Optional[int] = Field(default=None, alias="boilTime")
    boil_temperature: Optional[float] = Field(default=None, alias="boilTemperature")
    boil_off: Optional[float] = Field(default=None, alias="boilOff")
    trub_loss: Optional[float] = Field(default=None, alias="trubLoss")
    dead_space: Optional[float] = Field(default=None, alias="deadSpace")

    model_config = {"populate_by_name": True}

class EquipmentOut(BaseModel):
    id: int
    official_id: Optional[int] = Field(default=None, serialization_alias="officialId")
    user_id: int = Field(serialization_alias="userId")
    name: str
    description: Optional[str] = None
    efficiency: float
    batch_volume: float = Field(serialization_alias="batchVolume")
    batch_time: Optional[int] = Field(default=None, serialization_alias="batchTime")
    boil_time: Optional[int] = Field(default=None, serialization_alias="boilTime")
    boil_temperature: float = Field(serialization_alias="boilTemperature")
    boil_off: Optional[float] = Field(default=None, serialization_alias="boilOff")
    trub_loss: Optional[float] = Field(default=None, serialization_alias="trubLoss")
    dead_space: Optional[float] = Field(default=None, serialization_alias="deadSpace")
    created_at: datetime = Field(serialization_alias="createdAt")

    model_config = {"from_attributes": True}
