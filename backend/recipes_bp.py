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
    notes = db.Column(db.Text)

    recipe_fermentables = db.relationship('RecipeFermentable', backref='recipe', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "style": self.style,
            "description": self.description,
            "creationDate": self.creation_date.isoformat() if self.creation_date else None,
            "volumeLiters": float(self.volume_liters) if self.volume_liters else None,
            "notes": self.notes,
            "recipeFermentables": [fermentable.to_dict() for fermentable in self.recipe_fermentables]
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
    weight_grams = db.Column(db.Numeric)

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
            "weightGrams": float(self.weight_grams) if self.weight_grams else None
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
                weight_grams=fermentable_data.get("weightGrams")
            )
            db.session.add(new_fermentable)

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
        recipe.notes = data.get("notes", recipe.notes)

        fermentables_data = data.get("recipeFermentables", [])
        existing_fermentables = {fermentable.id: fermentable for fermentable in recipe.recipe_fermentables}

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
                fermentable.weight_grams = fermentable_data.get("weightGrams", fermentable.weight_grams)
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
                    weight_grams=fermentable_data["weightGrams"]
                )
                db.session.add(new_fermentable)

        sent_fermentable_ids = {fermentable_data.get("id") for fermentable_data in fermentables_data if fermentable_data.get("id")}
        for fermentable_id, fermentable in existing_fermentables.items():
            if fermentable_id not in sent_fermentable_ids:
                db.session.delete(fermentable)

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