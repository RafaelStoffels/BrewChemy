# app/routers/hops.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, and_, not_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Hop
from ..schemas.hops import HopCreate, HopUpdate, HopOut
from .users import token_required

router = APIRouter(prefix="/api/hops", tags=["hops"])

def _to_out(x: Hop) -> HopOut:
    return HopOut.model_validate(x)

@router.get("/search", response_model=List[HopOut])
def search_hops(
    searchTerm: str = Query(..., min_length=1),
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    subq = (
        select(Hop.official_id)
        .where(
            Hop.user_id == current_user_id,
            Hop.official_id.is_not(None),
        )
        .distinct()
    )
    sub_ids = [row[0] for row in db.execute(subq).all()]

    stmt = (
        select(Hop)
        .where(
            and_(
                or_(
                    Hop.user_id == current_user_id,
                    and_(Hop.user_id == 1, not_(Hop.id.in_(sub_ids))),
                ),
                Hop.name.ilike(f"%{searchTerm}%"),
            )
        )
        .limit(12)
    )
    items = db.execute(stmt).scalars().all()
    return [_to_out(i) for i in items]

@router.get("", response_model=List[HopOut])
def get_hops(
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    subq = (
        select(Hop.official_id)
        .where(
            Hop.user_id == current_user_id,
            Hop.official_id.is_not(None),
        )
        .distinct()
    )
    sub_ids = [row[0] for row in db.execute(subq).all()]

    stmt = (
        select(Hop)
        .where(
            or_(
                Hop.user_id == current_user_id,
                and_(Hop.user_id == 1, not_(Hop.id.in_(sub_ids))),
            )
        )
        .limit(12)
    )
    items = db.execute(stmt).scalars().all()
    return [_to_out(i) for i in items]

@router.get("/{itemUserId:int}/{id:int}", response_model=HopOut)
def get_hop(
    itemUserId: int,
    id: int,
    db: Session = Depends(get_db),
):
    item = db.execute(
        select(Hop).where(Hop.id == id, Hop.user_id == itemUserId)
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Hop not found")
    return _to_out(item)

@router.post("", status_code=status.HTTP_201_CREATED, response_model=HopOut)
def add_hop(
    payload: HopCreate,
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    data = payload.model_dump(by_alias=False)

    for key in ("alpha_acid_content", "beta_acid_content"):
        if isinstance(data.get(key), str) and data[key] == "":
            data[key] = None

    new_item = Hop(user_id=current_user_id, **data)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return _to_out(new_item)

@router.put("/{id:int}", response_model=HopOut)
def update_hop(
    id: int,
    payload: HopUpdate,
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    itemUserId = payload.itemUserId
    data = payload.model_dump(exclude_unset=True, by_alias=False)
    data.pop("itemUserId", None)

    if itemUserId != current_user_id:
        official = db.execute(
            select(Hop).where(Hop.id == id, Hop.user_id == 1)
        ).scalar_one_or_none()
        if not official:
            raise HTTPException(status_code=404, detail="Official hop not found")

        new_item = Hop(
            user_id=current_user_id,
            official_id=id,
            name=official.name,
            supplier=official.supplier,
            alpha_acid_content=official.alpha_acid_content,
            beta_acid_content=official.beta_acid_content,
            type=official.type,
            use_type=official.use_type,
            country_of_origin=official.country_of_origin,
            description=official.description,
        )
        for field, value in data.items():
            setattr(new_item, field, value)

        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return _to_out(new_item)

    item = db.execute(
        select(Hop).where(Hop.id == id, Hop.user_id == current_user_id)
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Hop not found")

    for field, value in data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return _to_out(item)

@router.delete("/{itemUserId:int}/{id:int}")
def delete_hop(
    itemUserId: int,
    id: int,
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    if itemUserId != current_user_id:
        raise HTTPException(status_code=404, detail="Cannot delete official record")

    item = db.execute(
        select(Hop).where(Hop.id == id, Hop.user_id == current_user_id)
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Hop not found")

    db.delete(item)
    db.commit()
    return {"message": f"Hop with ID {id} was successfully deleted"}
