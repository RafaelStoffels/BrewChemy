from flask import Blueprint, request, jsonify
from db import db
from AuthTokenVerifier import token_required
from models import Recipe, RecipeEquipment, RecipeFermentable, RecipeHop, RecipeMisc, RecipeYeast


def create_copy_recipe_bp():
    copy_recipe_bp = Blueprint("copy_recipe", __name__)

    @copy_recipe_bp.route("/recipes/copy", methods=["POST"])
    @token_required
    def copy_recipe(current_user_id):
        data = request.get_json()

        recipe_id = data.get("recipe_id")
        copy_target_user_id = data.get("copy_target_user_id")

        if not recipe_id or not copy_target_user_id:
            return jsonify({
                "error": ("The fields 'recipe_id' and 'copy_target_user_id' are required.")
            }), 400

        original_recipe = Recipe.query.filter_by(id=recipe_id, user_id=current_user_id).first()

        if not original_recipe:
            return jsonify({
                "error": ("Recipe not found or does not belong to the authenticated user.")
                }), 404

        new_recipe = Recipe(
            user_id=copy_target_user_id,
            name=f"{original_recipe.name} (Cópia)",
            style=original_recipe.style,
            description=original_recipe.description,
            volume_liters=original_recipe.volume_liters,
            notes=original_recipe.notes,
            author=original_recipe.author,
            type=original_recipe.type,
            equipment_id=original_recipe.equipment_id
        )

        db.session.add(new_recipe)

        #  Ensures that the ID of the new recipe is generated before copying the ingredients.
        db.session.flush()

        for fermentable in original_recipe.recipe_fermentables:
            novo_fermentable = RecipeFermentable(
                user_id=copy_target_user_id,
                recipe_id=new_recipe.id,
                name=fermentable.name,
                description=fermentable.description,
                ebc=fermentable.ebc,
                potential_extract=fermentable.potential_extract,
                malt_type=fermentable.malt_type,
                supplier=fermentable.supplier,
                unit_price=fermentable.unit_price,
                notes=fermentable.notes,
                quantity=fermentable.quantity
            )
            db.session.add(novo_fermentable)

        for hop in original_recipe.recipe_hops:
            novo_hop = RecipeHop(
                user_id=copy_target_user_id,
                recipe_id=new_recipe.id,
                name=hop.name,
                alpha_acid_content=hop.alpha_acid_content,
                beta_acid_content=hop.beta_acid_content,
                use_type=hop.use_type,
                country_of_origin=hop.country_of_origin,
                description=hop.description,
                quantity=hop.quantity,
                boil_time=hop.boil_time
            )
            db.session.add(novo_hop)

        for misc in original_recipe.recipe_misc:
            novo_misc = RecipeMisc(
                user_id=copy_target_user_id,
                recipe_id=new_recipe.id,
                name=misc.name,
                description=misc.description,
                type=misc.type,
                quantity=misc.quantity,
                use=misc.use,
                time=misc.time
            )
            db.session.add(novo_misc)

        for yeast in original_recipe.recipe_yeasts:
            novo_yeast = RecipeYeast(
                user_id=copy_target_user_id,
                recipe_id=new_recipe.id,
                name=yeast.name,
                manufacturer=yeast.manufacturer,
                type=yeast.type,
                form=yeast.form,
                attenuation=yeast.attenuation,
                temperature_range=yeast.temperature_range,
                alcohol_tolerance=yeast.alcohol_tolerance,
                flavor_profile=yeast.flavor_profile,
                flocculation=yeast.flocculation,
                description=yeast.description,
                quantity=yeast.quantity
            )
            db.session.add(novo_yeast)

        if original_recipe.recipe_equipment:
            original_equipment = original_recipe.recipe_equipment[0]
            new_equipment = RecipeEquipment(
                user_id=copy_target_user_id,
                recipe_id=new_recipe.id,
                name=original_equipment.name,
                description=original_equipment.description,
                efficiency=original_equipment.efficiency,
                batch_volume=original_equipment.batch_volume,
                boil_time=original_equipment.boil_time,
                boil_temperature=original_equipment.boil_temperature,
                batch_time=original_equipment.batch_time,
                boil_off=original_equipment.boil_off,
                dead_space=original_equipment.dead_space,
                trub_loss=original_equipment.trub_loss
            )
            db.session.add(new_equipment)

        db.session.commit()

        return jsonify({
            "message": "Recipe copied successfully!", "novaReceitaId": new_recipe.id
            }), 201

    return copy_recipe_bp
