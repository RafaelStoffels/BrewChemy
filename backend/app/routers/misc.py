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
                    and_(Misc.user_id == 1, not_(Misc.id.in_(sub_ids))),
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
                and_(Misc.user_id == 1, not_(Misc.id.in_(sub_ids))),
            )
        )
        .limit(12)
    )
    items = (await db.execute(stmt)).scalars().all()
    return [_to_out(i) for i in items]


@router.get("/{itemUserId:int}/{id:int}", response_model=MiscOut)
async def get_misc(
    itemUserId: int,
    id: int,
    db: AsyncSession = Depends(get_db),
):
    item = (await db.execute(
        select(Misc).where(Misc.id == id, Misc.user_id == itemUserId)
    )).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="misc not found")
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
    itemUserId = payload.itemUserId
    data = payload.model_dump(exclude_unset=True)
    data.pop("itemUserId", None)

    if itemUserId != current_user_id:
        official = (await db.execute(
            select(Misc).where(Misc.id == id, Misc.user_id == 1)
        )).scalar_one_or_none()
        if not official:
            raise HTTPException(status_code=404, detail="Official misc item not found")

        new_item = Misc(
            user_id=current_user_id,
            official_id=id,
            name=official.name,
            description=official.description,
            type=official.type,
        )
        for field, value in data.items():
            setattr(new_item, field, value)

        db.add(new_item)
        await db.commit()
        await db.refresh(new_item)
        return _to_out(new_item)

    item = (await db.execute(
        select(Misc).where(Misc.id == id, Misc.user_id == current_user_id)
    )).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Misc item not found")

    for field, value in data.items():
        setattr(item, field, value)

    await db.commit()
    await db.refresh(item)
    return _to_out(item)


@router.delete("/{itemUserId:int}/{id:int}")
async def delete_misc_item(
    itemUserId: int,
    id: int,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    if itemUserId != current_user_id:
        raise HTTPException(status_code=404, detail="Cannot delete official record")

    item = (await db.execute(
        select(Misc).where(Misc.id == id, Misc.user_id == current_user_id)
    )).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Misc item not found")

    await db.delete(item)
    await db.commit()
    return {"message": f"Misc item with ID {id} was successfully deleted"}
