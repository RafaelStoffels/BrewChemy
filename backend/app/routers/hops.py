# app/routers/hops.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, and_, not_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Hop
from ..schemas.hops import HopCreate, HopUpdate, HopOut
from .users import token_required

router = APIRouter(prefix="/api/hops", tags=["hops"])

ADMIN_ID = 1

def _to_out(x: Hop) -> HopOut:
    return HopOut.model_validate(x)

@router.get("/search", response_model=List[HopOut])
async def search_hops(
    searchTerm: str = Query(..., min_length=1),
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    subq = (
        select(Hop.official_id)
        .where(
            Hop.user_id == current_user_id,
            Hop.official_id.is_not(None),
        )
        .distinct()
    )
    sub_ids = (await db.execute(subq)).scalars().all()

    stmt = (
        select(Hop)
        .where(
            and_(
                or_(
                    Hop.user_id == current_user_id,
                    and_(Hop.user_id == ADMIN_ID, not_(Hop.id.in_(sub_ids))),
                ),
                Hop.name.ilike(f"%{searchTerm}%"),
            )
        )
        .limit(12)
    )
    items = (await db.execute(stmt)).scalars().all()
    return [_to_out(i) for i in items]

@router.get("", response_model=List[HopOut])
async def get_hops(
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    subq = (
        select(Hop.official_id)
        .where(
            Hop.user_id == current_user_id,
            Hop.official_id.is_not(None),
        )
        .distinct()
    )
    sub_ids = (await db.execute(subq)).scalars().all()

    stmt = (
        select(Hop)
        .where(
            or_(
                Hop.user_id == current_user_id,
                and_(Hop.user_id == ADMIN_ID, not_(Hop.id.in_(sub_ids))),
            )
        )
        .limit(12)
    )
    items = (await db.execute(stmt)).scalars().all()
    return [_to_out(i) for i in items]

@router.get("/{id:int}", response_model=HopOut)
async def get_hop(
    id: int,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    item = (await db.execute(
        select(Hop).where(Hop.id == id, Hop.user_id == current_user_id)
    )).scalar_one_or_none()

    if not item:
        item = (await db.execute(
            select(Hop).where(Hop.id == id, Hop.user_id == ADMIN_ID)
        )).scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Hop not found")

    return _to_out(item)

@router.post("", status_code=status.HTTP_201_CREATED, response_model=HopOut)
async def add_hop(
    payload: HopCreate,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump(by_alias=False)

    for key in ("alpha_acid_content", "beta_acid_content"):
        if isinstance(data.get(key), str) and data[key] == "":
            data[key] = None

    new_item = Hop(user_id=current_user_id, **data)
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return _to_out(new_item)

@router.put("/{id:int}", response_model=HopOut)
async def update_hop(
    id: int,
    payload: HopUpdate,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True, by_alias=False)
    data.pop("itemUserId", None)

    item = (await db.execute(
        select(Hop).where(Hop.id == id)
    )).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Hop not found")

    if item.user_id == current_user_id:
        for field, value in data.items():
            setattr(item, field, value)
        await db.commit()
        await db.refresh(item)
        return _to_out(item)

    if item.user_id == ADMIN_ID:
        new_item = Hop(
            user_id=current_user_id,
            official_id=item.id,
            name=item.name,
            supplier=item.supplier,
            alpha_acid_content=item.alpha_acid_content,
            beta_acid_content=item.beta_acid_content,
            type=item.type,
            use_type=item.use_type,
            country_of_origin=item.country_of_origin,
            description=item.description,
        )
        for field, value in data.items():
            setattr(new_item, field, value)

        db.add(new_item)
        await db.commit()
        await db.refresh(new_item)
        return _to_out(new_item)

    raise HTTPException(status_code=404, detail="Hop not found")

@router.delete("/{id:int}")
async def delete_hop(
    id: int,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    item = (await db.execute(
        select(Hop).where(Hop.id == id)
    )).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Hop not found")

    if item.user_id == ADMIN_ID:
        raise HTTPException(status_code=404, detail="Cannot delete official record")

    if item.user_id != current_user_id:
        raise HTTPException(status_code=404, detail="Hop not found")

    await db.delete(item)
    await db.commit()
    return {"message": f"Hop with ID {id} was successfully deleted"}
