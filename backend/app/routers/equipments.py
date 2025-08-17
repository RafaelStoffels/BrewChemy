# app/routers/equipments.py
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, and_, not_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Equipment
from ..schemas.equipments import EquipmentCreate, EquipmentUpdate, EquipmentOut
from .users import token_required

router = APIRouter(prefix="/api/equipments", tags=["equipments"])


def _to_out(e: Equipment) -> EquipmentOut:
    return EquipmentOut.from_orm(e)


@router.get("/search", response_model=List[EquipmentOut])
def search_equipments(
    searchTerm: str = Query(..., min_length=1),
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    subq = (
        select(Equipment.official_id)
        .where(
            Equipment.user_id == current_user_id,
            Equipment.official_id.is_not(None),
        )
        .distinct()
    )
    sub_ids = [row[0] for row in db.execute(subq).all()]

    stmt = (
        select(Equipment)
        .where(
            and_(
                or_(
                    Equipment.user_id == current_user_id,
                    and_(Equipment.user_id == 1, not_(Equipment.id.in_(sub_ids))),
                ),
                Equipment.name.ilike(f"%{searchTerm}%"),
            )
        )
        .limit(12)
    )
    items = db.execute(stmt).scalars().all()
    return [_to_out(i) for i in items]


@router.get("", response_model=List[EquipmentOut])
def get_equipments(
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    subq = (
        select(Equipment.official_id)
        .where(
            Equipment.user_id == current_user_id,
            Equipment.official_id.is_not(None),
        )
        .distinct()
    )
    sub_ids = [row[0] for row in db.execute(subq).all()]

    stmt = (
        select(Equipment)
        .where(
            or_(
                Equipment.user_id == current_user_id,
                and_(
                    Equipment.user_id == 1,
                    not_(Equipment.id.in_(sub_ids)),
                ),
            )
        )
        .limit(12)
    )
    items = db.execute(stmt).scalars().all()
    return [_to_out(i) for i in items]


@router.get("/{itemUserId:int}/{id:int}", response_model=EquipmentOut)
def get_equipment(
    itemUserId: int,
    id: int,
    db: Session = Depends(get_db),
):
    stmt = select(Equipment).where(
        Equipment.id == id,
        Equipment.user_id == itemUserId,
    )
    item = db.execute(stmt).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return _to_out(item)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=EquipmentOut)
def add_equipment(
    payload: EquipmentCreate,
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    data = payload.model_dump(by_alias=False)

    new_item = Equipment(
        user_id=current_user_id,
        **data,
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return _to_out(new_item)


@router.put("/{id:int}", response_model=EquipmentOut)
def update_equipment(
    id: int,
    payload: EquipmentUpdate,
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    itemUserId = payload.itemUserId

    data = payload.model_dump(exclude_unset=True, by_alias=False)
    data.pop("itemUserId", None)

    if itemUserId != current_user_id:
        official = db.execute(
            select(Equipment).where(Equipment.id == id, Equipment.user_id == 1)
        ).scalar_one_or_none()
        if not official:
            raise HTTPException(status_code=404, detail="Official equipment not found")

        new_item = Equipment(
            user_id=current_user_id,
            official_id=id,
            name=official.name,
            description=official.description,
            efficiency=official.efficiency,
            batch_volume=official.batch_volume,
            batch_time=official.batch_time,
            boil_time=official.boil_time,
            boil_temperature=official.boil_temperature,
            boil_off=official.boil_off,
            trub_loss=official.trub_loss,
            dead_space=official.dead_space,
            created_at=datetime.now(timezone.utc),
        )

        for field, value in data.items():
            setattr(new_item, field, value)

        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item

    item = db.execute(
        select(Equipment).where(
            Equipment.id == id, Equipment.user_id == current_user_id
        )
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")

    for field, value in data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{itemUserId:int}/{id:int}")
def delete_equipment(
    itemUserId: int,
    id: int,
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    if itemUserId != current_user_id:
        raise HTTPException(status_code=404, detail="Cannot delete official record")

    item = db.execute(
        select(Equipment).where(
            Equipment.id == id, Equipment.user_id == current_user_id
        )
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")

    db.delete(item)
    db.commit()
    return {"message": f"Equipment with ID {id} was successfully deleted"}
