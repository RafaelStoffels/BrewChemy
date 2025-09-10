# app/routers/equipments.py
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, and_, not_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Equipment
from ..schemas.equipments import EquipmentCreate, EquipmentUpdate, EquipmentOut
from .users import token_required

router = APIRouter(prefix="/api/equipments", tags=["equipments"])

ADMIN_ID = 1

def _to_out(e: Equipment) -> EquipmentOut:
    # Se estiver usando Pydantic v2, prefira model_validate(e) em vez de from_orm
    return EquipmentOut.model_validate(e)


@router.get("/search", response_model=List[EquipmentOut])
async def search_equipments(
    searchTerm: str = Query(..., min_length=1),
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    subq = (
        select(Equipment.official_id)
        .where(
            Equipment.user_id == current_user_id,
            Equipment.official_id.is_not(None),
        )
        .distinct()
    )
    sub_ids = (await db.execute(subq)).scalars().all()

    stmt = (
        select(Equipment)
        .where(
            and_(
                or_(
                    Equipment.user_id == current_user_id,
                    and_(Equipment.user_id == ADMIN_ID, not_(Equipment.id.in_(sub_ids))),
                ),
                Equipment.name.ilike(f"%{searchTerm}%"),
            )
        )
        .limit(12)
    )
    items = (await db.execute(stmt)).scalars().all()
    return [_to_out(i) for i in items]


@router.get("", response_model=List[EquipmentOut])
async def get_equipments(
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    subq = (
        select(Equipment.official_id)
        .where(
            Equipment.user_id == current_user_id,
            Equipment.official_id.is_not(None),
        )
        .distinct()
    )
    sub_ids = (await db.execute(subq)).scalars().all()

    stmt = (
        select(Equipment)
        .where(
            or_(
                Equipment.user_id == current_user_id,
                and_(
                    Equipment.user_id == ADMIN_ID,
                    not_(Equipment.id.in_(sub_ids)),
                ),
            )
        )
        .limit(12)
    )
    items = (await db.execute(stmt)).scalars().all()
    return [_to_out(i) for i in items]


@router.get("/{id:int}", response_model=EquipmentOut)
async def get_equipment(
    id: int,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    item = (await db.execute(
        select(Equipment).where(Equipment.id == id, Equipment.user_id == current_user_id)
    )).scalar_one_or_none()

    if not item:
        item = (await db.execute(
            select(Equipment).where(Equipment.id == id, Equipment.user_id == ADMIN_ID)
        )).scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")

    return _to_out(item)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=EquipmentOut)
async def add_equipment(
    payload: EquipmentCreate,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump(by_alias=False)

    new_item = Equipment(
        user_id=current_user_id,
        **data,
        created_at=datetime.utcnow(),
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return _to_out(new_item)


@router.put("/{id:int}", response_model=EquipmentOut)
async def update_equipment(
    id: int,
    payload: EquipmentUpdate,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True, by_alias=False)
    data.pop("itemUserId", None)

    # find by id
    item = (await db.execute(
        select(Equipment).where(Equipment.id == id)
    )).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")

    # logged user then apply
    if item.user_id == current_user_id:
        for field, value in data.items():
            setattr(item, field, value)
        await db.commit()
        await db.refresh(item)
        return _to_out(item)

    # admin user
    if item.user_id == ADMIN_ID:
        new_item = Equipment(
            user_id=current_user_id,
            official_id=item.id,
            name=item.name,
            description=item.description,
            efficiency=item.efficiency,
            batch_volume=item.batch_volume,
            batch_time=item.batch_time,
            boil_time=item.boil_time,
            boil_temperature=item.boil_temperature,
            boil_off=item.boil_off,
            trub_loss=item.trub_loss,
            dead_space=item.dead_space,
            created_at=datetime.utcnow(),
        )
        for field, value in data.items():
            setattr(new_item, field, value)

        db.add(new_item)
        await db.commit()
        await db.refresh(new_item)
        return _to_out(new_item)

    # another user
    raise HTTPException(status_code=404, detail="Equipment not found")


@router.delete("/{id:int}")
async def delete_equipment(
    id: int,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    item = (await db.execute(
        select(Equipment).where(Equipment.id == id)
    )).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if item.user_id == ADMIN_ID:
        raise HTTPException(status_code=404, detail="Cannot delete official record")

    if item.user_id != current_user_id:
        raise HTTPException(status_code=404, detail="Equipment not found")

    await db.delete(item)
    await db.commit()
    return {"message": f"Equipment with ID {id} was successfully deleted"}
