# app/routers/fermentables.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, and_, not_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Fermentable
from ..schemas.fermentables import FermentableCreate, FermentableUpdate, FermentableOut
from .users import token_required

router = APIRouter(prefix="/api/fermentables", tags=["fermentables"])

def _to_out(x: Fermentable) -> FermentableOut:
    return FermentableOut.model_validate(x)

@router.get("/search", response_model=List[FermentableOut])
def search_fermentables(
    searchTerm: str = Query(..., min_length=1),
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    subq = (
        select(Fermentable.official_id)
        .where(
            Fermentable.user_id == current_user_id,
            Fermentable.official_id.is_not(None),
        )
        .distinct()
    )
    sub_ids = [row[0] for row in db.execute(subq).all()]

    stmt = (
        select(Fermentable)
        .where(
            and_(
                or_(
                    Fermentable.user_id == current_user_id,
                    and_(
                        Fermentable.user_id == 1,
                        not_(Fermentable.id.in_(sub_ids)),
                    ),
                ),
                Fermentable.name.ilike(f"%{searchTerm}%"),
            )
        )
        .limit(12)
    )
    items = db.execute(stmt).scalars().all()
    return [_to_out(i) for i in items]


@router.get("", response_model=List[FermentableOut])
def get_fermentables(
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    subq = (
        select(Fermentable.official_id)
        .where(
            Fermentable.user_id == current_user_id,
            Fermentable.official_id.is_not(None),
        )
        .distinct()
    )
    sub_ids = [row[0] for row in db.execute(subq).all()]

    stmt = (
        select(Fermentable)
        .where(
            or_(
                Fermentable.user_id == current_user_id,
                and_(
                    Fermentable.user_id == 1,
                    not_(Fermentable.id.in_(sub_ids)),
                ),
            )
        )
        .limit(12)
    )
    items = db.execute(stmt).scalars().all()
    return [_to_out(i) for i in items]


@router.get("/{itemUserId:int}/{id:int}", response_model=FermentableOut)
def get_fermentable(
    itemUserId: int,
    id: int,
    db: Session = Depends(get_db),
):
    stmt = select(Fermentable).where(
        Fermentable.id == id,
        Fermentable.user_id == itemUserId,
    )
    item = db.execute(stmt).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Fermentable not found")
    return _to_out(item)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=FermentableOut)
def add_fermentable(
    payload: FermentableCreate,
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    data = payload.model_dump(by_alias=False)

    if isinstance(data.get("ebc"), str) and data["ebc"] == "":
        data["ebc"] = None

    new_item = Fermentable(
        user_id=current_user_id,
        **data,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return _to_out(new_item)


@router.put("/{id:int}", response_model=FermentableOut)
def update_fermentable(
    id: int,
    payload: FermentableUpdate,
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    itemUserId = payload.itemUserId
    data = payload.model_dump(exclude_unset=True, by_alias=False)
    data.pop("itemUserId", None)

    if itemUserId != current_user_id:
        official = db.execute(
            select(Fermentable).where(Fermentable.id == id, Fermentable.user_id == 1)
        ).scalar_one_or_none()
        if not official:
            raise HTTPException(status_code=404, detail="Official fermentable not found")

        new_item = Fermentable(
            user_id=current_user_id,
            official_id=id,
            name=official.name,
            description=official.description,
            ebc=official.ebc,
            potential_extract=official.potential_extract,
            type=official.type,
            supplier=official.supplier,
        )
        for field, value in data.items():
            setattr(new_item, field, value)

        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return _to_out(new_item)

    item = db.execute(
        select(Fermentable).where(Fermentable.id == id, Fermentable.user_id == current_user_id)
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Fermentable not found")

    for field, value in data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return _to_out(item)


@router.delete("/{itemUserId:int}/{id:int}")
def delete_fermentable(
    itemUserId: int,
    id: int,
    current_user_id: int = Depends(token_required),
    db: Session = Depends(get_db),
):
    if itemUserId != current_user_id:
        raise HTTPException(status_code=404, detail="Cannot delete official record")

    item = db.execute(
        select(Fermentable).where(Fermentable.id == id, Fermentable.user_id == current_user_id)
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Fermentable not found")

    db.delete(item)
    db.commit()
    return {"message": f"Fermentable with ID {id} was successfully deleted"}
