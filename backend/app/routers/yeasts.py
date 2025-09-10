# app/routers/yeasts.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, and_, not_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Yeast
from ..schemas.yeasts import YeastCreate, YeastUpdate, YeastOut
from .users import token_required

router = APIRouter(prefix="/api/yeasts", tags=["yeasts"])

ADMIN_ID = 1  # admin user owns official/global records


def _to_out(x: Yeast) -> YeastOut:
    # Pydantic v2: ensure YeastOut has ConfigDict(from_attributes=True)
    return YeastOut.model_validate(x)


@router.get("/search", response_model=List[YeastOut])
async def search_yeasts(
    searchTerm: str = Query(..., min_length=1),
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    # Exclude admin "official" records already customized by the current user
    subq = (
        select(Yeast.official_id)
        .where(Yeast.user_id == current_user_id, Yeast.official_id.is_not(None))
        .distinct()
    )
    sub_ids = (await db.execute(subq)).scalars().all()

    stmt = (
        select(Yeast)
        .where(
            and_(
                or_(
                    Yeast.user_id == current_user_id,
                    and_(Yeast.user_id == ADMIN_ID, not_(Yeast.id.in_(sub_ids))),
                ),
                Yeast.name.ilike(f"%{searchTerm}%"),
            )
        )
        .limit(12)
    )
    items = (await db.execute(stmt)).scalars().all()
    return [_to_out(i) for i in items]


@router.get("", response_model=List[YeastOut])
async def get_yeasts(
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    # Exclude admin "official" records already customized by the current user
    subq = (
        select(Yeast.official_id)
        .where(Yeast.user_id == current_user_id, Yeast.official_id.is_not(None))
        .distinct()
    )
    sub_ids = (await db.execute(subq)).scalars().all()

    stmt = (
        select(Yeast)
        .where(
            or_(
                Yeast.user_id == current_user_id,
                and_(Yeast.user_id == ADMIN_ID, not_(Yeast.id.in_(sub_ids))),
            )
        )
        .limit(12)
    )
    items = (await db.execute(stmt)).scalars().all()
    return [_to_out(i) for i in items]


@router.get("/{id:int}", response_model=YeastOut)
async def get_yeast(
    id: int,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    # 1) Try user-owned record; 2) fallback to official (admin) record
    item = (await db.execute(
        select(Yeast).where(Yeast.id == id, Yeast.user_id == current_user_id)
    )).scalar_one_or_none()

    if not item:
        item = (await db.execute(
            select(Yeast).where(Yeast.id == id, Yeast.user_id == ADMIN_ID)
        )).scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Yeast not found")

    return _to_out(item)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=YeastOut)
async def add_yeast(
    payload: YeastCreate,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump(by_alias=False)
    new_item = Yeast(user_id=current_user_id, **data)
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return _to_out(new_item)


@router.put("/{id:int}", response_model=YeastOut)
async def update_yeast(
    id: int,
    payload: YeastUpdate,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    # Ignore any legacy itemUserId that might still be present in the payload
    data = payload.model_dump(exclude_unset=True, by_alias=False)
    data.pop("itemUserId", None)

    # Fetch by id only; do not trust ownership hints from the client
    item = (await db.execute(select(Yeast).where(Yeast.id == id))).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Yeast not found")

    # Case 1: current user's record → update in place
    if item.user_id == current_user_id:
        for field, value in data.items():
            setattr(item, field, value)
        await db.commit()
        await db.refresh(item)
        return _to_out(item)

    # Case 2: official/admin record → clone to current user and apply changes
    if item.user_id == ADMIN_ID:
        new_item = Yeast(
            user_id=current_user_id,
            official_id=item.id,
            name=item.name,
            manufacturer=item.manufacturer,
            type=item.type,
            form=item.form,
            attenuation=item.attenuation,
            temperature_range=item.temperature_range,
            flavor_profile=item.flavor_profile,
            flocculation=item.flocculation,
            description=item.description,
        )
        for field, value in data.items():
            setattr(new_item, field, value)

        db.add(new_item)
        await db.commit()
        await db.refresh(new_item)
        return _to_out(new_item)

    # Case 3: record belongs to a different user → not visible/updateable
    raise HTTPException(status_code=404, detail="Yeast not found")


@router.delete("/{id:int}")
async def delete_yeast(
    id: int,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    item = (await db.execute(select(Yeast).where(Yeast.id == id))).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Yeast not found")

    # Do not allow deleting admin/official records
    if item.user_id == ADMIN_ID:
        raise HTTPException(status_code=404, detail="Cannot delete official record")

    if item.user_id != current_user_id:
        raise HTTPException(status_code=404, detail="Yeast not found")

    await db.delete(item)
    await db.commit()
    return {"message": f"Yeast with ID {id} was successfully deleted"}
