# app/routers/miscs.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, and_, not_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Misc
from ..schemas.misc import MiscCreate, MiscUpdate, MiscOut
from .users import token_required

router = APIRouter(prefix="/api/miscs", tags=["miscs"])

ADMIN_ID = 1

def _to_out(x: Misc) -> MiscOut:
    return MiscOut.model_validate(x)

@router.get("/search", response_model=List[MiscOut])
async def search_miscs(
    searchTerm: str = Query(..., min_length=1),
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    subq = (
        select(Misc.official_id)
        .where(Misc.user_id == current_user_id, Misc.official_id.is_not(None))
        .distinct()
    )
    sub_ids = (await db.execute(subq)).scalars().all()

    stmt = (
        select(Misc)
        .where(
            and_(
                or_(
                    Misc.user_id == current_user_id,
                    and_(Misc.user_id == ADMIN_ID, not_(Misc.id.in_(sub_ids))),
                ),
                Misc.name.ilike(f"%{searchTerm}%"),
            )
        )
        .limit(12)
    )
    items = (await db.execute(stmt)).scalars().all()
    return [_to_out(i) for i in items]

@router.get("", response_model=List[MiscOut])
async def get_miscs(
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    subq = (
        select(Misc.official_id)
        .where(Misc.user_id == current_user_id, Misc.official_id.is_not(None))
        .distinct()
    )
    sub_ids = (await db.execute(subq)).scalars().all()

    stmt = (
        select(Misc)
        .where(
            or_(
                Misc.user_id == current_user_id,
                and_(Misc.user_id == ADMIN_ID, not_(Misc.id.in_(sub_ids))),
            )
        )
        .limit(12)
    )
    items = (await db.execute(stmt)).scalars().all()
    return [_to_out(i) for i in items]

@router.get("/{id:int}", response_model=MiscOut)
async def get_misc(
    id: int,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    item = (await db.execute(
        select(Misc).where(Misc.id == id, Misc.user_id == current_user_id)
    )).scalar_one_or_none()

    if not item:
        item = (await db.execute(
            select(Misc).where(Misc.id == id, Misc.user_id == ADMIN_ID)
        )).scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Misc item not found")

    return _to_out(item)

@router.post("", status_code=status.HTTP_201_CREATED, response_model=MiscOut)
async def add_misc_item(
    payload: MiscCreate,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    new_item = Misc(
        user_id=current_user_id,
        name=payload.name,
        description=payload.description,
        type=payload.type,
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return _to_out(new_item)

@router.put("/{id:int}", response_model=MiscOut)
async def update_misc(
    id: int,
    payload: MiscUpdate,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True, by_alias=False)
    data.pop("itemUserId", None)

    item = (await db.execute(
        select(Misc).where(Misc.id == id)
    )).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Misc item not found")

    if item.user_id == current_user_id:
        for field, value in data.items():
            setattr(item, field, value)
        await db.commit()
        await db.refresh(item)
        return _to_out(item)

    if item.user_id == ADMIN_ID:
        new_item = Misc(
            user_id=current_user_id,
            official_id=item.id,
            name=item.name,
            description=item.description,
            type=item.type,
        )
        for field, value in data.items():
            setattr(new_item, field, value)

        db.add(new_item)
        await db.commit()
        await db.refresh(new_item)
        return _to_out(new_item)

    raise HTTPException(status_code=404, detail="Misc item not found")

@router.delete("/{id:int}")
async def delete_misc_item(
    id: int,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    item = (await db.execute(
        select(Misc).where(Misc.id == id)
    )).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Misc item not found")

    if item.user_id == 1 and current_user_id != ADMIN_ID:
        raise HTTPException(status_code=404, detail="Cannot delete official record")

    if item.user_id != current_user_id:
        raise HTTPException(status_code=404, detail="Misc item not found")

    await db.delete(item)
    await db.commit()
    return {"message": f"Misc item with ID {id} was successfully deleted"}
