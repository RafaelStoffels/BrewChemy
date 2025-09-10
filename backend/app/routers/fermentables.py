# app/routers/fermentables.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, and_, not_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Fermentable
from ..schemas.fermentables import FermentableCreate, FermentableUpdate, FermentableOut
from .users import token_required

router = APIRouter(prefix="/api/fermentables", tags=["fermentables"])

ADMIN_ID = 1


def _to_out(x: Fermentable) -> FermentableOut:
    return FermentableOut.model_validate(x)


@router.get("/search", response_model=List[FermentableOut])
async def search_fermentables(
    searchTerm: str = Query(..., min_length=1),
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    subq = (
        select(Fermentable.official_id)
        .where(
            Fermentable.user_id == current_user_id,
            Fermentable.official_id.is_not(None),
        )
        .distinct()
    )
    sub_ids = (await db.execute(subq)).scalars().all()

    stmt = (
        select(Fermentable)
        .where(
            and_(
                or_(
                    Fermentable.user_id == current_user_id,
                    and_(
                        Fermentable.user_id == ADMIN_ID,
                        not_(Fermentable.id.in_(sub_ids)),
                    ),
                ),
                Fermentable.name.ilike(f"%{searchTerm}%"),
            )
        )
        .limit(12)
    )
    items = (await db.execute(stmt)).scalars().all()
    return [_to_out(i) for i in items]


@router.get("", response_model=List[FermentableOut])
async def get_fermentables(
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    subq = (
        select(Fermentable.official_id)
        .where(
            Fermentable.user_id == current_user_id,
            Fermentable.official_id.is_not(None),
        )
        .distinct()
    )
    sub_ids = (await db.execute(subq)).scalars().all()

    stmt = (
        select(Fermentable)
        .where(
            or_(
                Fermentable.user_id == current_user_id,
                and_(
                    Fermentable.user_id == ADMIN_ID,
                    not_(Fermentable.id.in_(sub_ids)),
                ),
            )
        )
        .limit(12)
    )
    items = (await db.execute(stmt)).scalars().all()
    return [_to_out(i) for i in items]


@router.get("/{id:int}", response_model=FermentableOut)
async def get_fermentable(
    id: int,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    item = (await db.execute(
        select(Fermentable).where(
            Fermentable.id == id,
            or_(
                Fermentable.user_id == current_user_id,
                Fermentable.user_id == ADMIN_ID,
            ),
        )
    )).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Fermentable not found")
    return _to_out(item)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=FermentableOut)
async def add_fermentable(
    payload: FermentableCreate,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump(by_alias=False)
    if isinstance(data.get("ebc"), str) and data["ebc"] == "":
        data["ebc"] = None

    new_item = Fermentable(
        user_id=current_user_id,
        **data,
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return _to_out(new_item)


@router.put("/{id:int}", response_model=FermentableOut)
async def update_fermentable(
    id: int,
    payload: FermentableUpdate,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True, by_alias=False)
    data.pop("itemUserId", None)

    item = (await db.execute(
        select(Fermentable).where(Fermentable.id == id)
    )).scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Fermentable not found")

    if item.user_id == current_user_id:
        for field, value in data.items():
            setattr(item, field, value)
        await db.commit()
        await db.refresh(item)
        return _to_out(item)

    if item.user_id == ADMIN_ID:
        new_item = Fermentable(
            user_id=current_user_id,
            official_id=item.id,
            name=item.name,
            description=item.description,
            ebc=item.ebc,
            potential_extract=item.potential_extract,
            type=item.type,
            supplier=item.supplier,
        )
        for field, value in data.items():
            setattr(new_item, field, value)

        db.add(new_item)
        await db.commit()
        await db.refresh(new_item)
        return _to_out(new_item)

    raise HTTPException(status_code=404, detail="Fermentable not found")


@router.delete("/{id:int}")
async def delete_fermentable(
    id: int,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    item = (await db.execute(
        select(Fermentable).where(Fermentable.id == id)
    )).scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Fermentable not found")

    if item.user_id == 1 and current_user_id != ADMIN_ID:
        raise HTTPException(status_code=404, detail="Cannot delete official record")

    if item.user_id != current_user_id:
        raise HTTPException(status_code=404, detail="Fermentable not found")

    await db.delete(item)
    await db.commit()
    return {"message": f"Fermentable with ID {id} was successfully deleted"}
