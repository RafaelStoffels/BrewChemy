from flask import Blueprint, jsonify, request
from db import db
from models import Recipe, RecipeEquipment, RecipeFermentable, RecipeHop, RecipeMisc, RecipeYeast
from AuthTokenVerifier import token_required
from marshmallow import ValidationError
from schemas.recipes_schema import RecipeSchema


def create_recipes_bp():
    recipes_bp = Blueprint("recipes", __name__)

    @recipes_bp.route("/recipes/search", methods=["GET"])
    @token_required
    def search_recipes(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()

        if not search_term:
            return jsonify({"error": "O parâmetro 'searchTerm' é obrigatório."}), 400

        recipes = Recipe.query.filter(
            (Recipe.user_id == current_user_id),
            Recipe.name.ilike(f"%{search_term}%")
        ).all()

        return jsonify([Recipe.to_dict() for Recipe in recipes])

    @recipes_bp.route("/recipes", methods=["GET"])
    @token_required
    def get_recipes(current_user_id):
        recipes = Recipe.query.filter_by(user_id=current_user_id).all()
        return jsonify([recipe.to_dict() for recipe in recipes])

    @recipes_bp.route("/recipes/<int:id>", methods=["GET"])
    @token_required
    def get_recipe(current_user_id, id):
        recipe = Recipe.query.filter_by(id=id, user_id=current_user_id).first()
        if recipe is None:
            return jsonify({"message": "Recipe not found"}), 404
        return jsonify(recipe.to_dict())

    @recipes_bp.route("/recipes", methods=["POST"])
    @token_required
    def add_recipe(current_user_id):
        schema = RecipeSchema()

        try:
            data = schema.load(request.json)
        except ValidationError as err:
            return jsonify({"errors": err.messages}), 400

        new_recipe = Recipe(
            name=data.get("name"),
            style=data.get("style"),
            description=data.get("description"),
            notes=data.get("notes"),
            author=data.get("author"),
            type=data.get("type"),
            user_id=current_user_id
        )
        db.session.add(new_recipe)
        db.session.flush()

        fermentables_data = data.get("recipeFermentables", [])
        for fermentable_data in fermentables_data:
            new_fermentable = RecipeFermentable(
                recipe_id=new_recipe.id,
                user_id=current_user_id,
                name=fermentable_data["name"],
                description=fermentable_data.get("description"),
                ebc=fermentable_data["ebc"],
                potential_extract=fermentable_data["potentialExtract"],
                type=fermentable_data.get("type"),
                supplier=fermentable_data.get("supplier"),
                unit_price=fermentable_data.get("unitPrice"),
                quantity=fermentable_data.get("quantity")
            )
            db.session.add(new_fermentable)

        hops_data = data.get("recipeHops", [])
        for hop_data in hops_data:
            new_hop = RecipeHop(
                recipe_id=new_recipe.id,
                name=hop_data["name"],
                alpha_acid_content=hop_data.get("alphaAcidContent"),
                beta_acid_content=hop_data.get("betaAcidContent"),
                use_type=hop_data.get("useType"),
                country_of_origin=hop_data.get("countryOfOrigin"),
                description=hop_data.get("description"),
                quantity=hop_data.get("quantity"),
                boil_time=hop_data.get("boilTime")
            )
            db.session.add(new_hop)

        miscs_data = data.get("recipeMisc", [])
        for misc_data in miscs_data:
            new_misc = RecipeMisc(
                recipe_id=new_recipe.id,
                name=misc_data["name"],
                description=misc_data["description"],
                type=misc_data["type"],
                quantity=misc_data["quantity"],
                use=misc_data["use"]
            )
            db.session.add(new_misc)

        yeast_data = data.get("recipeYeasts", [])
        for yeast_data_item in yeast_data:
            new_yeast = RecipeYeast(
                recipe_id=new_recipe.id,
                name=yeast_data_item["name"],
                manufacturer=yeast_data_item["manufacturer"],
                type=yeast_data_item["type"],
                form=yeast_data_item["form"],
                attenuation=yeast_data_item["attenuation"],
                temperature_range=yeast_data_item["temperature_range"],
                flavor_profile=yeast_data_item.get("flavor_profile"),
                flocculation=yeast_data_item["flocculation"],
                description=yeast_data_item.get("description"),
                quantity=yeast_data_item.get("quantity")
            )
            db.session.add(new_yeast)

        db.session.commit()
        return jsonify(new_recipe.to_dict()), 201

    @recipes_bp.route("/recipes/<int:id>", methods=["PUT"])
    @token_required
    def update_recipe(current_user_id, id):
        recipe = Recipe.query.filter_by(id=id, user_id=current_user_id).first()
        if recipe is None:
            return jsonify({"message": "Recipe not found"}), 404

        data = request.json

        recipe.name = data.get("name", recipe.name)
        recipe.style = data.get("style", recipe.style)
        recipe.description = data.get("description", recipe.description)
        recipe.notes = data.get("notes", recipe.notes)
        recipe.author = data.get("author", recipe.author)
        recipe.type = data.get("type", recipe.type)

        fermentables_data = data.get("recipeFermentables", [])
        existing_fermentables = {
            fermentable.id: fermentable
            for fermentable in recipe.recipe_fermentables
        }

        equipment_data = data.get("recipeEquipment", {})
        if equipment_data:

            existing_equipment = RecipeEquipment.query.filter_by(recipe_id=recipe.id).first()

            if existing_equipment:

                existing_equipment.name = equipment_data["name"]
                existing_equipment.description = equipment_data.get("description")
                existing_equipment.efficiency = equipment_data["efficiency"]
                existing_equipment.batch_volume = equipment_data["batchVolume"]
                existing_equipment.boil_time = equipment_data["boilTime"]
                existing_equipment.boil_temperature = equipment_data["boilTemperature"]
                existing_equipment.batch_time = equipment_data["batchTime"]
                existing_equipment.boil_off = equipment_data["boilOff"]
                existing_equipment.dead_space = equipment_data["deadSpace"]
                existing_equipment.trub_loss = equipment_data["trubLoss"]
            else:
                new_equipment = RecipeEquipment(
                    recipe_id=recipe.id,
                    name=equipment_data["name"],
                    description=equipment_data.get("description"),
                    efficiency=equipment_data["efficiency"],
                    batch_volume=equipment_data["batchVolume"],
                    boil_time=equipment_data["boilTime"],
                    boil_temperature=equipment_data["boilTemperature"],
                    batch_time=equipment_data["batchTime"],
                    boil_off=equipment_data["boilOff"],
                    dead_space=equipment_data["deadSpace"],
                    trub_loss=equipment_data["trubLoss"]
                )
                db.session.add(new_equipment)

        for fermentable_data in fermentables_data:
            fermentable_id = fermentable_data.get("id")
            if fermentable_id and fermentable_id in existing_fermentables:
                fermentable = existing_fermentables[fermentable_id]
                fermentable.name = fermentable_data.get("name", fermentable.name)
                fermentable.description = fermentable_data.get(
                    "description", fermentable.description
                )
                fermentable.ebc = fermentable_data.get("ebc", fermentable.ebc)
                fermentable.potential_extract = fermentable_data.get(
                    "potentialExtract", fermentable.potential_extract
                )
                fermentable.type = fermentable_data.get("type", fermentable.type)
                fermentable.supplier = fermentable_data.get("supplier", fermentable.supplier)
                fermentable.unit_price = fermentable_data.get("unitPrice", fermentable.unit_price)
                fermentable.quantity = fermentable_data.get("quantity", fermentable.quantity)
            else:
                new_fermentable = RecipeFermentable(
                    recipe_id=recipe.id,
                    user_id=current_user_id,
                    name=fermentable_data["name"],
                    description=fermentable_data.get("description"),
                    ebc=fermentable_data["ebc"],
                    potential_extract=fermentable_data["potentialExtract"],
                    type=fermentable_data.get("type"),
                    supplier=fermentable_data.get("supplier"),
                    unit_price=fermentable_data.get("unitPrice"),
                    quantity=fermentable_data["quantity"]
                )
                db.session.add(new_fermentable)

        hops_data = data.get("recipeHops", [])
        existing_hops = {hop.id: hop for hop in recipe.recipe_hops}

        for hop_data in hops_data:
            hop_id = hop_data.get("id")
            if hop_id and hop_id in existing_hops:
                hop = existing_hops[hop_id]
                hop.name = hop_data.get("name", hop.name)
                hop.alpha_acid_content = hop_data.get("alphaAcidContent", hop.alpha_acid_content)
                hop.beta_acid_content = hop_data.get("betaAcidContent", hop.beta_acid_content)
                hop.use_type = hop_data.get("useType", hop.use_type)
                hop.country_of_origin = hop_data.get("countryOfOrigin", hop.country_of_origin)
                hop.description = hop_data.get("description", hop.description)
                hop.quantity = hop_data.get("quantity", hop.quantity)
                hop.boil_time = hop_data.get("boilTime", hop.boil_time)
            else:
                new_hop = RecipeHop(
                    recipe_id=recipe.id,
                    name=hop_data["name"],
                    alpha_acid_content=hop_data.get("alphaAcidContent"),
                    beta_acid_content=hop_data.get("betaAcidContent"),
                    use_type=hop_data.get("useType"),
                    country_of_origin=hop_data.get("countryOfOrigin"),
                    description=hop_data.get("description"),
                    quantity=hop_data.get("quantity"),
                    boil_time=hop_data.get("boilTime")
                )
                db.session.add(new_hop)

        miscs_data = data.get("recipeMisc", [])
        existing_misc = {misc.id: misc for misc in recipe.recipe_misc}

        for misc_item in miscs_data:
            misc_id = misc_item.get("id")
            if misc_id and misc_id in existing_misc:
                misc = existing_misc[misc_id]
                misc.name = misc_item.get("name", misc.name)
                misc.description = misc_item.get("description", misc.description)
                misc.type = misc_item.get("type", misc.type)
                misc.quantity = misc_item.get("quantity", misc.quantity)
                misc.use = misc_item.get("use", misc.use)
                misc.time = misc_item.get("time", misc.time)
            else:
                new_misc = RecipeMisc(
                    recipe_id=recipe.id,
                    name=misc_item["name"],
                    description=misc_item.get("description"),
                    type=misc_item.get("type"),
                    quantity=misc_item.get("quantity"),
                    use=misc_item.get("use"),
                    time=misc_item.get("time")
                )
                db.session.add(new_misc)

        yeast_data = data.get("recipeYeasts", [])
        existing_yeasts = {yeast.id: yeast for yeast in recipe.recipe_yeasts}
        for yeast_data_item in yeast_data:

            existing_yeast = RecipeYeast.query.filter_by(
                recipe_id=recipe.id, name=yeast_data_item["name"]
            ).first()

            if existing_yeast:
                existing_yeast.manufacturer = yeast_data_item["manufacturer"]
                existing_yeast.type = yeast_data_item["type"]
                existing_yeast.form = yeast_data_item["form"]
                existing_yeast.attenuation = yeast_data_item["attenuation"]
                existing_yeast.temperature_range = yeast_data_item["temperatureRange"]
                existing_yeast.flavor_profile = yeast_data_item.get("flavorProfile")
                existing_yeast.flocculation = yeast_data_item["flocculation"]
                existing_yeast.description = yeast_data_item.get("description")
                existing_yeast.quantity = yeast_data_item.get("quantity")
            else:
                new_yeast = RecipeYeast(
                    recipe_id=recipe.id,
                    name=yeast_data_item["name"],
                    manufacturer=yeast_data_item["manufacturer"],
                    type=yeast_data_item["type"],
                    form=yeast_data_item["form"],
                    attenuation=yeast_data_item["attenuation"],
                    temperature_range=yeast_data_item["temperatureRange"],
                    flavor_profile=yeast_data_item.get("flavorProfile"),
                    flocculation=yeast_data_item["flocculation"],
                    description=yeast_data_item.get("description"),
                    quantity=yeast_data_item.get("quantity")
                )
                db.session.add(new_yeast)

        sent_fermentable_ids = {
            fermentable_data.get("id")
            for fermentable_data in fermentables_data
            if fermentable_data.get("id")
        }
        for fermentable_id, fermentable in existing_fermentables.items():
            if fermentable_id not in sent_fermentable_ids:
                db.session.delete(fermentable)

        sent_hop_ids = {hop_data.get("id") for hop_data in hops_data if hop_data.get("id")}
        for hop_id, hop in existing_hops.items():
            if hop_id not in sent_hop_ids:
                db.session.delete(hop)

        sent_misc_ids = {misc_data.get("id") for misc_data in miscs_data if misc_data.get("id")}
        for misc_id, misc in existing_misc.items():
            if misc_id not in sent_misc_ids:
                db.session.delete(misc)

        sent_yeast_ids = {yeast_data.get("id") for yeast_data in yeast_data if yeast_data.get("id")}
        for yeast_id, yeast in existing_yeasts.items():
            if yeast_id not in sent_yeast_ids:
                db.session.delete(yeast)

        db.session.commit()
        return jsonify(recipe.to_dict()), 200

    @recipes_bp.route("/recipes/<int:id>", methods=["DELETE"])
    @token_required
    def delete_recipe(current_user_id, id):
        recipe = Recipe.query.filter_by(id=id, user_id=current_user_id).first()
        if recipe is None:
            return jsonify({"message": "Recipe not found"}), 404

        db.session.delete(recipe)
        db.session.commit()
        return jsonify({"message": "Recipe deleted"}), 200

    return recipes_bp
