from flask import Blueprint, jsonify, request
from db import db
from AuthTokenVerifier import token_required

class Recipe(db.Model):
    __tablename__ = 'recipes'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    style = db.Column(db.String(100))
    description = db.Column(db.Text)
    creation_date = db.Column(db.Date, default=db.func.current_date())
    volume_liters = db.Column(db.Numeric(5, 2))
    equipment_id = db.Column(db.Integer)
    notes = db.Column(db.Text)

    recipe_fermentables = db.relationship('RecipeFermentable', backref='recipe', lazy=True, cascade="all, delete-orphan")
    recipe_hops = db.relationship('RecipeHop', backref='recipe', lazy=True, cascade="all, delete-orphan")
    recipe_misc = db.relationship('RecipeMisc', backref='recipe', lazy=True, cascade="all, delete-orphan")
    recipe_yeasts = db.relationship('RecipeYeast', backref='recipe', lazy=True, cascade="all, delete-orphan")
    recipe_equipment = db.relationship('RecipeEquipment', backref='recipe')

    def to_dict(self):
        # Verifica se existe algum equipamento associado à receita
        recipe_equipment = self.recipe_equipment[0] if self.recipe_equipment else None

        return {
            "id": self.id,
            "name": self.name,
            "style": self.style,
            "description": self.description,
            "creationDate": self.creation_date.isoformat() if self.creation_date else None,
            "volumeLiters": float(self.volume_liters) if self.volume_liters else None,
            "notes": self.notes,
            "recipeEquipment": recipe_equipment.to_dict() if recipe_equipment else None,
            "recipeFermentables": [fermentable.to_dict() for fermentable in self.recipe_fermentables],
            "recipeHops": [hop.to_dict() for hop in self.recipe_hops],
            "recipeMisc": [misc.to_dict() for misc in self.recipe_misc],
            "recipeYeasts": [yeast.to_dict() for yeast in self.recipe_yeasts]
            
        }

class RecipeEquipment(db.Model):
    __tablename__ = 'recipe_equipment'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    efficiency = db.Column(db.Numeric(5, 2), nullable=False)
    batch_volume = db.Column(db.Numeric(10, 2), nullable=False)
    boil_time = db.Column(db.Integer, nullable=False)
    boil_temperature = db.Column(db.Numeric(5, 2), nullable=False)
    batch_time = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "recipeId": self.recipe_id,
            "name": self.name,
            "description": self.description,
            "efficiency": float(self.efficiency) if self.efficiency else None,
            "batchVolume": float(self.batch_volume) if self.batch_volume else None,
            "boilTime": self.boil_time,
            "boilTemperature": float(self.boil_temperature) if self.boil_temperature else None,
            "batchTime": self.batch_time
        }

class RecipeFermentable(db.Model):
    __tablename__ = 'recipe_fermentables'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    ebc = db.Column(db.Numeric(5, 2), nullable=False)
    potential_extract = db.Column(db.Numeric(5, 3), nullable=False)
    malt_type = db.Column(db.String(50))
    supplier = db.Column(db.String(100))
    unit_price = db.Column(db.Numeric(10, 2))
    notes = db.Column(db.Text)
    quantity = db.Column(db.Numeric)

    def to_dict(self):
        return {
            "id": self.id,
            "recipeId": self.recipe_id,
            "name": self.name,
            "description": self.description,
            "ebc": float(self.ebc),
            "potentialExtract": float(self.potential_extract),
            "maltType": self.malt_type,
            "supplier": self.supplier,
            "unitPrice": float(self.unit_price) if self.unit_price else None,
            "notes": self.notes,
            "quantity": float(self.quantity) if self.quantity else None
        }
    
class RecipeHop(db.Model):
    __tablename__ = 'recipe_hops'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    alpha_acid_content = db.Column(db.Numeric(5, 2))
    beta_acid_content = db.Column(db.Numeric(5, 2))
    use_type = db.Column(db.String(50))
    country_of_origin = db.Column(db.String(50))
    description = db.Column(db.Text)
    quantity = db.Column(db.Numeric)
    boil_time = db.Column(db.Integer)

    def to_dict(self):
        return {
            "id": self.id,
            "recipeId": self.recipe_id,
            "name": self.name,
            "alphaAcidContent": float(self.alpha_acid_content) if self.alpha_acid_content else None,
            "betaAcidContent": float(self.beta_acid_content) if self.beta_acid_content else None,
            "useType": self.use_type,
            "countryOfOrigin": self.country_of_origin,
            "description": self.description,
            "quantity": float(self.quantity) if self.quantity else None,
            "boilTime": self.boil_time
        }
    
class RecipeMisc(db.Model):
    __tablename__ = 'recipe_misc'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(30))
    quantity = db.Column(db.Numeric)
    use = db.Column(db.String(30))
    time = db.Column(db.Integer)

    def to_dict(self):
        return {
            "id": self.id,
            "recipeId": self.recipe_id,
            "name": self.name,
            "description": self.description,
            "type": self.type,
            "quantity": float(self.quantity) if self.quantity else None,
            "use": self.use,
            "time": self.time
        }

class RecipeYeast(db.Model):
    __tablename__ = 'recipe_yeasts'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    manufacturer = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    form = db.Column(db.String(50), nullable=False)
    attenuation_range = db.Column(db.String(20), nullable=False)
    temperature_range = db.Column(db.String(20), nullable=False)
    alcohol_tolerance = db.Column(db.String(50), nullable=False)
    flavor_profile = db.Column(db.Text) 
    flocculation = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text)
    quantity = db.Column(db.Numeric)

    def to_dict(self):
        return {
            "id": self.id,
            "recipeId": self.recipe_id,
            "name": self.name,
            "manufacturer": self.manufacturer,
            "type": self.type,
            "form": self.form,
            "attenuationRange": self.attenuation_range,
            "temperatureRange": self.temperature_range,
            "alcoholTolerance": self.alcohol_tolerance,
            "flavorProfile": self.flavor_profile,
            "flocculation": self.flocculation,
            "description": self.description,
            "quantity": float(self.quantity) if self.quantity else None
        }

def create_recipes_bp():
    recipes_bp = Blueprint("recipes", __name__)

    # Return all records
    @recipes_bp.route("/recipes", methods=["GET"])
    @token_required
    def get_recipes(current_user_id):
        recipes = Recipe.query.filter_by(user_id=current_user_id).all()
        return jsonify([recipe.to_dict() for recipe in recipes])

    # Return a specific record
    @recipes_bp.route("/recipes/<int:id>", methods=["GET"])
    @token_required
    def get_recipe(current_user_id, id):
        recipe = Recipe.query.filter_by(id=id, user_id=current_user_id).first()
        if recipe is None:
            return jsonify({"message": "Recipe not found"}), 404
        return jsonify(recipe.to_dict())

    # Add record
    @recipes_bp.route("/recipes", methods=["POST"])
    @token_required
    def add_recipe(current_user_id):
        data = request.json

        def sanitize(value):
            return value if value != "" else None

        new_recipe = Recipe(
            name=data.get("name"),
            style=data.get("style"),
            description=data.get("description"),
            volume_liters=sanitize(data.get("volumeLiters")),
            notes=data.get("notes"),
            equipment_id=data.get("equipmentID"),
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
                malt_type=fermentable_data.get("maltType"),
                supplier=fermentable_data.get("supplier"),
                unit_price=fermentable_data.get("unitPrice"),
                notes=fermentable_data.get("notes"),
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
                attenuation_range=yeast_data_item["attenuation_range"],
                temperature_range=yeast_data_item["temperature_range"],
                alcohol_tolerance=yeast_data_item["alcohol_tolerance"],
                flavor_profile=yeast_data_item.get("flavor_profile"),
                flocculation=yeast_data_item["flocculation"],
                description=yeast_data_item.get("description"),
                quantity=yeast_data_item.get("quantity")
            )
            db.session.add(new_yeast)

        db.session.commit()
        return jsonify(new_recipe.to_dict()), 201

    # Update record
    @recipes_bp.route("/recipes/<int:id>", methods=["PUT"])
    @token_required
    def update_recipe(current_user_id, id):
        recipe = Recipe.query.filter_by(id=id, user_id=current_user_id).first()
        if recipe is None:
            return jsonify({"message": "Recipe not found"}), 404

        data = request.json

        print(data);

        def sanitize(value):
            return value if value != "" else None

        recipe.name = data.get("name", recipe.name)
        recipe.style = data.get("style", recipe.style)
        recipe.description = data.get("description", recipe.description)
        recipe.volume_liters = data.get("volumeLiters", recipe.volume_liters)
        recipe.equipment_id = data.get("equipmentID", recipe.equipment_id)
        recipe.notes = data.get("notes", recipe.notes)

        fermentables_data = data.get("recipeFermentables", [])
        existing_fermentables = {fermentable.id: fermentable for fermentable in recipe.recipe_fermentables}

        # Update equipment
        equipment_data = data.get("recipeEquipment", {})
        if equipment_data:
            # Verifica se já existe um equipamento associado à receita
            existing_equipment = RecipeEquipment.query.filter_by(recipe_id=recipe.id).first()

            if existing_equipment:
                # Atualiza os campos existentes
                existing_equipment.name = equipment_data["name"]
                existing_equipment.description = equipment_data.get("description")
                existing_equipment.efficiency = equipment_data["efficiency"]
                existing_equipment.batch_volume = equipment_data["batchVolume"]
                existing_equipment.boil_time = equipment_data["boilTime"]
                existing_equipment.boil_temperature = equipment_data["boilTemperature"]
                existing_equipment.batch_time = equipment_data["batchTime"]
            else:
                # Se não encontrar, cria um novo objeto de equipamento
                new_equipment = RecipeEquipment(
                    recipe_id=recipe.id,
                    name=equipment_data["name"],
                    description=equipment_data.get("description"),
                    efficiency=equipment_data["efficiency"],
                    batch_volume=equipment_data["batchVolume"],
                    boil_time=equipment_data["boilTime"],
                    boil_temperature=equipment_data["boilTemperature"],
                    batch_time=equipment_data["batchTime"],
                )
                db.session.add(new_equipment)

        # Update fermentable
        for fermentable_data in fermentables_data:
            fermentable_id = fermentable_data.get("id")
            if fermentable_id and fermentable_id in existing_fermentables:
                fermentable = existing_fermentables[fermentable_id]
                fermentable.name = fermentable_data.get("name", fermentable.name)
                fermentable.description = fermentable_data.get("description", fermentable.description)
                fermentable.ebc = fermentable_data.get("ebc", fermentable.ebc)
                fermentable.potential_extract = fermentable_data.get("potentialExtract", fermentable.potential_extract)
                fermentable.malt_type = fermentable_data.get("maltType", fermentable.malt_type)
                fermentable.supplier = fermentable_data.get("supplier", fermentable.supplier)
                fermentable.unit_price = fermentable_data.get("unitPrice", fermentable.unit_price)
                fermentable.notes = fermentable_data.get("notes", fermentable.notes)
                fermentable.quantity = fermentable_data.get("quantity", fermentable.quantity)
            else:
                new_fermentable = RecipeFermentable(
                    recipe_id=recipe.id,
                    user_id=current_user_id,
                    name=fermentable_data["name"],
                    description=fermentable_data.get("description"),
                    ebc=fermentable_data["ebc"],
                    potential_extract=fermentable_data["potentialExtract"],
                    malt_type=fermentable_data.get("maltType"),
                    supplier=fermentable_data.get("supplier"),
                    unit_price=fermentable_data.get("unitPrice"),
                    notes=fermentable_data.get("notes"),
                    quantity=fermentable_data["quantity"]
                )
                db.session.add(new_fermentable)

        # Atualização de hops
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

        # Atualização de misc
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

        # Atualizar yeast
        yeast_data = data.get("recipeYeasts", [])
        existing_yeasts = {yeast.id: yeast for yeast in recipe.recipe_yeasts}
        for yeast_data_item in yeast_data:
            # Verifique se o yeast já existe (por exemplo, por id ou nome, conforme seu modelo)
            existing_yeast = RecipeYeast.query.filter_by(
                recipe_id=recipe.id, name=yeast_data_item["name"]
            ).first()

            if existing_yeast:
                # Atualiza os campos existentes
                existing_yeast.manufacturer = yeast_data_item["manufacturer"]
                existing_yeast.type = yeast_data_item["type"]
                existing_yeast.form = yeast_data_item["form"]
                existing_yeast.attenuation_range = yeast_data_item["attenuationRange"]
                existing_yeast.temperature_range = yeast_data_item["temperatureRange"]
                existing_yeast.alcohol_tolerance = yeast_data_item["alcoholTolerance"]
                existing_yeast.flavor_profile = yeast_data_item.get("flavorProfile")
                existing_yeast.flocculation = yeast_data_item["flocculation"]
                existing_yeast.description = yeast_data_item.get("description")
                existing_yeast.quantity = yeast_data_item.get("quantity")
            else:
                # Se não encontrar, cria um novo objeto de yeast
                new_yeast = RecipeYeast(
                    recipe_id=recipe.id,
                    name=yeast_data_item["name"],
                    manufacturer=yeast_data_item["manufacturer"],
                    type=yeast_data_item["type"],
                    form=yeast_data_item["form"],
                    attenuation_range=yeast_data_item["attenuationRange"],
                    temperature_range=yeast_data_item["temperatureRange"],
                    alcohol_tolerance=yeast_data_item["alcoholTolerance"],
                    flavor_profile=yeast_data_item.get("flavorProfile"),
                    flocculation=yeast_data_item["flocculation"],
                    description=yeast_data_item.get("description"),
                    quantity=yeast_data_item.get("quantity")
                )
                db.session.add(new_yeast)

        # Remover fermentables deletados
        sent_fermentable_ids = {fermentable_data.get("id") for fermentable_data in fermentables_data if fermentable_data.get("id")}
        for fermentable_id, fermentable in existing_fermentables.items():
            if fermentable_id not in sent_fermentable_ids:
                db.session.delete(fermentable)

        # Remover hops deletados
        sent_hop_ids = {hop_data.get("id") for hop_data in hops_data if hop_data.get("id")}
        for hop_id, hop in existing_hops.items():
            if hop_id not in sent_hop_ids:
                db.session.delete(hop)

        # Remover misc deletados
        sent_misc_ids = {misc_data.get("id") for misc_data in miscs_data if misc_data.get("id")}
        for misc_id, misc in existing_misc.items():
            if misc_id not in sent_misc_ids:
                db.session.delete(misc)

        # Remover hops deletados
        sent_yeast_ids = {yeast_data.get("id") for yeast_data in yeast_data if yeast_data.get("id")}
        for yeast_id, yeast in existing_yeasts.items():
            if yeast_id not in sent_yeast_ids:
                db.session.delete(yeast)

        db.session.commit()
        return jsonify(recipe.to_dict()), 200

    # Delete record
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