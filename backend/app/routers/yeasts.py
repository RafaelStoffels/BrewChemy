# app/routers/yeasts.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, and_, not_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Yeast
from ..schemas.yeasts import YeastCreate, YeastUpdate, YeastOut
from .users import token_required

router = APIRouter(prefix="/api/yeasts", tags=["yeasts"])


def _to_out(x: Yeast) -> YeastOut:
    return YeastOut.model_validate(x)


@router.get("/search", response_model=List[YeastOut])
def search_yeasts(
    searchTerm: str = Query(..., min_length=1),
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    subq = (
        select(Yeast.official_id)
        .where(Yeast.user_id == current_user_id, Yeast.official_id.is_not(None))
        .distinct()
    )
    sub_ids = [row[0] for row in db.execute(subq).all()]

    stmt = (
        select(Yeast)
        .where(
            and_(
                or_(
                    Yeast.user_id == current_user_id,
                    and_(Yeast.user_id == 1, not_(Yeast.id.in_(sub_ids))),
                ),
                Yeast.name.ilike(f"%{searchTerm}%"),
            )
        )
        .limit(12)
    )
    items = db.execute(stmt).scalars().all()
    return [_to_out(i) for i in items]


@router.get("", response_model=List[YeastOut])
def get_yeasts(
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    subq = (
        select(Yeast.official_id)
        .where(Yeast.user_id == current_user_id, Yeast.official_id.is_not(None))
        .distinct()
    )
    sub_ids = [row[0] for row in db.execute(subq).all()]

    stmt = (
        select(Yeast)
        .where(
            or_(
                Yeast.user_id == current_user_id,
                and_(Yeast.user_id == 1, not_(Yeast.id.in_(sub_ids))),
            )
        )
        .limit(12)
    )
    items = db.execute(stmt).scalars().all()
    return [_to_out(i) for i in items]


@router.get("/{itemUserId:int}/{id:int}", response_model=YeastOut)
def get_yeast(
    itemUserId: int,
    id: int,
    db: Session = Depends(get_db),
):
    item = db.execute(
        select(Yeast).where(Yeast.id == id, Yeast.user_id == itemUserId)
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="yeast not found")
    return _to_out(item)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=YeastOut)
def add_yeast(
    payload: YeastCreate,
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    data = payload.model_dump(by_alias=False)
    new_item = Yeast(user_id=current_user_id, **data)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return _to_out(new_item)


@router.put("/{id:int}", response_model=YeastOut)
def update_yeast(
    id: int,
    payload: YeastUpdate,
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    itemUserId = payload.itemUserId
    data = payload.model_dump(exclude_unset=True, by_alias=False)
    data.pop("itemUserId", None)

    if itemUserId != current_user_id:
        official = db.execute(
            select(Yeast).where(Yeast.id == id, Yeast.user_id == 1)
        ).scalar_one_or_none()
        if not official:
            raise HTTPException(status_code=404, detail="Official yeast not found")

        new_item = Yeast(
            user_id=current_user_id,
            official_id=id,
            name=official.name,
            manufacturer=official.manufacturer,
            type=official.type,
            form=official.form,
            attenuation=official.attenuation,
            temperature_range=official.temperature_range,
            flavor_profile=official.flavor_profile,
            flocculation=official.flocculation,
            description=official.description,
        )
        for field, value in data.items():
            setattr(new_item, field, value)

        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return _to_out(new_item)

    item = db.execute(
        select(Yeast).where(Yeast.id == id, Yeast.user_id == current_user_id)
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Yeast not found")

    for field, value in data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return _to_out(item)


@router.delete("/{itemUserId:int}/{id:int}")
def delete_yeast(
    itemUserId: int,
    id: int,
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    if itemUserId != current_user_id:
        raise HTTPException(status_code=404, detail="Cannot delete official record")

    item = db.execute(
        select(Yeast).where(Yeast.id == id, Yeast.user_id == current_user_id)
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Yeast not found")

    db.delete(item)
    db.commit()
    return {"message": f"Yeast with ID {id} was successfully deleted"}
