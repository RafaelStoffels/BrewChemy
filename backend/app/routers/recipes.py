# app/routers/recipes.py
from typing import List, Set
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import (
    Recipe,
    RecipeEquipment,
    RecipeFermentable,
    RecipeHop,
    RecipeMisc,
    RecipeYeast,
)
from ..schemas.recipes import RecipeCreate, RecipeUpdate, RecipeOut
from .users import token_required

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


def _to_out(r: Recipe) -> RecipeOut:
    return RecipeOut.model_validate(r)


@router.get("/search", response_model=List[RecipeOut])
async def search_recipes(
    searchTerm: str = Query(..., min_length=1),
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Recipe).where(
        Recipe.user_id == current_user_id,
        Recipe.name.ilike(f"%{searchTerm}%"),
    )
    items = (await db.execute(stmt)).scalars().all()
    return [_to_out(i) for i in items]


@router.get("", response_model=List[RecipeOut])
async def get_recipes(
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    items = (await db.execute(
        select(Recipe).where(Recipe.user_id == current_user_id)
    )).scalars().all()
    return [_to_out(i) for i in items]


@router.get("/{id:int}", response_model=RecipeOut)
async def get_recipe(
    id: int,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    item = (await db.execute(
        select(Recipe).where(Recipe.id == id, Recipe.user_id == current_user_id)
    )).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return _to_out(item)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=RecipeOut)
async def add_recipe(
    payload: RecipeCreate,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    recipe = Recipe(
        user_id=current_user_id,
        name=payload.name,
        style=payload.style,
        description=payload.description,
        notes=payload.notes,
        author=(payload.author or ""),
        type=payload.type,
    )
    db.add(recipe)
    await db.flush()

    eq = payload.recipeEquipment
    if eq:
        db.add(
            RecipeEquipment(
                user_id=current_user_id,
                recipe_id=recipe.id,
                name=eq.name,
                description=eq.description,
                efficiency=eq.efficiency,
                batch_volume=eq.batchVolume,
                boil_time=eq.boilTime,
                boil_temperature=eq.boilTemperature,
                batch_time=eq.batchTime,
                boil_off=eq.boilOff,
                dead_space=eq.deadSpace,
                trub_loss=eq.trubLoss,
            )
        )

    # fermentables
    for f in payload.recipeFermentables or []:
        db.add(
            RecipeFermentable(
                user_id=current_user_id,
                recipe_id=recipe.id,
                name=f.name,
                description=f.description,
                ebc=f.ebc,
                potential_extract=f.potentialExtract,
                type=f.type,
                supplier=f.supplier,
                unit_price=f.unitPrice,
                quantity=f.quantity,
            )
        )

    # hops
    for h in payload.recipeHops or []:
        db.add(
            RecipeHop(
                user_id=current_user_id,
                recipe_id=recipe.id,
                name=h.name,
                alpha_acid_content=h.alphaAcidContent,
                beta_acid_content=h.betaAcidContent,
                use_type=h.useType,
                country_of_origin=h.countryOfOrigin,
                description=h.description,
                quantity=h.quantity,
                boil_time=h.boilTime,
                usage_stage=h.usageStage,
            )
        )

    # misc
    for m in payload.recipeMisc or []:
        db.add(
            RecipeMisc(
                user_id=current_user_id,
                recipe_id=recipe.id,
                name=m.name,
                description=m.description,
                type=m.type,
                quantity=m.quantity,
                use=m.use,
                time=m.time,
            )
        )

    # yeasts
    for y in payload.recipeYeasts or []:
        db.add(
            RecipeYeast(
                user_id=current_user_id,
                recipe_id=recipe.id,
                name=y.name,
                manufacturer=y.manufacturer,
                type=y.type,
                form=y.form,
                attenuation=y.attenuation,
                temperature_range=y.temperatureRange,
                flavor_profile=y.flavorProfile,
                flocculation=y.flocculation,
                description=y.description,
                quantity=y.quantity,
            )
        )

    await db.commit()
    await db.refresh(recipe)
    return _to_out(recipe)


@router.put("/{id:int}", response_model=RecipeOut)
async def update_recipe(
    id: int,
    payload: RecipeUpdate,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    recipe = (await db.execute(
        select(Recipe).where(Recipe.id == id, Recipe.user_id == current_user_id)
    )).scalar_one_or_none()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # campos simples
    if payload.name is not None:
        recipe.name = payload.name
    if payload.style is not None:
        recipe.style = payload.style
    if payload.description is not None:
        recipe.description = payload.description
    if payload.notes is not None:
        recipe.notes = payload.notes
    if payload.author is not None:
        recipe.author = payload.author
    if payload.type is not None:
        recipe.type = payload.type

    # equipment (0..1)
    eq = payload.recipeEquipment
    if eq:
        existing_eq = (await db.execute(
            select(RecipeEquipment).where(RecipeEquipment.recipe_id == recipe.id)
        )).scalar_one_or_none()
        if existing_eq:
            existing_eq.name = eq.name
            existing_eq.description = eq.description
            existing_eq.efficiency = eq.efficiency
            existing_eq.batch_volume = eq.batchVolume
            existing_eq.boil_time = eq.boilTime
            existing_eq.boil_temperature = eq.boilTemperature
            existing_eq.batch_time = eq.batchTime
            existing_eq.boil_off = eq.boilOff
            existing_eq.dead_space = eq.deadSpace
            existing_eq.trub_loss = eq.trubLoss
        else:
            db.add(
                RecipeEquipment(
                    user_id=current_user_id,
                    recipe_id=recipe.id,
                    name=eq.name,
                    description=eq.description,
                    efficiency=eq.efficiency,
                    batch_volume=eq.batchVolume,
                    boil_time=eq.boilTime,
                    boil_temperature=eq.boilTemperature,
                    batch_time=eq.batchTime,
                    boil_off=eq.boilOff,
                    dead_space=eq.deadSpace,
                    trub_loss=eq.trubLoss,
                )
            )

    # ---------- Fermentables ----------
    sent_f_ids: Set[int] = {f.id for f in (payload.recipeFermentables or []) if f.id is not None}
    existing_fs = (await db.execute(
        select(RecipeFermentable).where(RecipeFermentable.recipe_id == recipe.id)
    )).scalars().all()
    existing_f_by_id = {f.id: f for f in existing_fs if f.id is not None}

    for f in (payload.recipeFermentables or []):
        if f.id and f.id in existing_f_by_id:
            obj = existing_f_by_id[f.id]
            obj.name = f.name or obj.name
            obj.description = f.description if f.description is not None else obj.description
            obj.ebc = f.ebc if f.ebc is not None else obj.ebc
            obj.potential_extract = (
                f.potentialExtract if f.potentialExtract is not None else obj.potential_extract
            )
            obj.type = f.type if f.type is not None else obj.type
            obj.supplier = f.supplier if f.supplier is not None else obj.supplier
            obj.unit_price = f.unitPrice if f.unitPrice is not None else obj.unit_price
            obj.quantity = f.quantity if f.quantity is not None else obj.quantity
        else:
            db.add(
                RecipeFermentable(
                    user_id=current_user_id,
                    recipe_id=recipe.id,
                    name=f.name,
                    description=f.description,
                    ebc=f.ebc,
                    potential_extract=f.potentialExtract,
                    type=f.type,
                    supplier=f.supplier,
                    unit_price=f.unitPrice,
                    quantity=f.quantity,
                )
            )

    for fid, obj in list(existing_f_by_id.items()):
        if fid not in sent_f_ids:
            await db.delete(obj)

    # ---------- Hops ----------
    sent_h_ids: Set[int] = {h.id for h in (payload.recipeHops or []) if h.id is not None}
    existing_hs = (await db.execute(
        select(RecipeHop).where(RecipeHop.recipe_id == recipe.id)
    )).scalars().all()
    existing_h_by_id = {h.id: h for h in existing_hs if h.id is not None}

    for h in (payload.recipeHops or []):
        if h.id and h.id in existing_h_by_id:
            obj = existing_h_by_id[h.id]
            obj.name = h.name or obj.name
            obj.alpha_acid_content = h.alphaAcidContent if h.alphaAcidContent is not None else obj.alpha_acid_content
            obj.beta_acid_content = h.betaAcidContent if h.betaAcidContent is not None else obj.beta_acid_content
            obj.use_type = h.useType if h.useType is not None else obj.use_type
            obj.country_of_origin = h.countryOfOrigin if h.countryOfOrigin is not None else obj.country_of_origin
            obj.description = h.description if h.description is not None else obj.description
            obj.quantity = h.quantity if h.quantity is not None else obj.quantity
            obj.boil_time = h.boilTime if h.boilTime is not None else obj.boil_time
            obj.usage_stage = h.usageStage if h.usageStage is not None else obj.usage_stage
        else:
            db.add(
                RecipeHop(
                    user_id=current_user_id,
                    recipe_id=recipe.id,
                    name=h.name,
                    alpha_acid_content=h.alphaAcidContent,
                    beta_acid_content=h.betaAcidContent,
                    use_type=h.useType,
                    country_of_origin=h.countryOfOrigin,
                    description=h.description,
                    quantity=h.quantity,
                    boil_time=h.boilTime,
                    usage_stage=h.usageStage,
                )
            )

    for hid, obj in list(existing_h_by_id.items()):
        if hid not in sent_h_ids:
            await db.delete(obj)

    # ---------- Miscs ----------
    sent_m_ids: Set[int] = {m.id for m in (payload.recipeMisc or []) if m.id is not None}
    existing_ms = (await db.execute(
        select(RecipeMisc).where(RecipeMisc.recipe_id == recipe.id)
    )).scalars().all()
    existing_m_by_id = {m.id: m for m in existing_ms if m.id is not None}

    for m in (payload.recipeMisc or []):
        if m.id and m.id in existing_m_by_id:
            obj = existing_m_by_id[m.id]
            obj.name = m.name or obj.name
            obj.description = m.description if m.description is not None else obj.description
            obj.type = m.type if m.type is not None else obj.type
            obj.quantity = m.quantity if m.quantity is not None else obj.quantity
            obj.use = m.use if m.use is not None else obj.use
            obj.time = m.time if m.time is not None else obj.time
        else:
            db.add(
                RecipeMisc(
                    user_id=current_user_id,
                    recipe_id=recipe.id,
                    name=m.name,
                    description=m.description,
                    type=m.type,
                    quantity=m.quantity,
                    use=m.use,
                    time=m.time,
                )
            )

    for mid, obj in list(existing_m_by_id.items()):
        if mid not in sent_m_ids:
            await db.delete(obj)

    # ---------- Yeasts ----------
    sent_y_ids: Set[int] = {y.id for y in (payload.recipeYeasts or []) if y.id is not None}
    existing_ys = (await db.execute(
        select(RecipeYeast).where(RecipeYeast.recipe_id == recipe.id)
    )).scalars().all()
    existing_y_by_id = {y.id: y for y in existing_ys if y.id is not None}

    for y in (payload.recipeYeasts or []):
        if y.id and y.id in existing_y_by_id:
            obj = existing_y_by_id[y.id]
            obj.name = y.name or obj.name
            obj.manufacturer = y.manufacturer if y.manufacturer is not None else obj.manufacturer
            obj.type = y.type if y.type is not None else obj.type
            obj.form = y.form if y.form is not None else obj.form
            obj.attenuation = y.attenuation if y.attenuation is not None else obj.attenuation
            obj.temperature_range = y.temperatureRange if y.temperatureRange is not None else obj.temperature_range
            obj.flavor_profile = y.flavorProfile if y.flavorProfile is not None else obj.flavor_profile
            obj.flocculation = y.flocculation if y.flocculation is not None else obj.flocculation
            obj.description = y.description if y.description is not None else obj.description
            obj.quantity = y.quantity if y.quantity is not None else obj.quantity
        else:
            db.add(
                RecipeYeast(
                    user_id=current_user_id,
                    recipe_id=recipe.id,
                    name=y.name,
                    manufacturer=y.manufacturer,
                    type=y.type,
                    form=y.form,
                    attenuation=y.attenuation,
                    temperature_range=y.temperatureRange,
                    flavor_profile=y.flavorProfile,
                    flocculation=y.flocculation,
                    description=y.description,
                    quantity=y.quantity,
                )
            )

    for yid, obj in list(existing_y_by_id.items()):
        if yid not in sent_y_ids:
            await db.delete(obj)

    await db.commit()
    await db.refresh(recipe)
    return _to_out(recipe)


@router.delete("/{id:int}")
async def delete_recipe(
    id: int,
    current_user_id: int = Depends(token_required),
    db: AsyncSession = Depends(get_db),
):
    recipe = (await db.execute(
        select(Recipe).where(Recipe.id == id, Recipe.user_id == current_user_id)
    )).scalar_one_or_none()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    await db.delete(recipe)
    await db.commit()
    return {"message": "Recipe deleted"}
