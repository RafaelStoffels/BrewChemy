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

    malts = db.relationship('RecipeMalt', backref='Recipe', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "style": self.style,
            "description": self.description,
            "creation_date": self.creation_date.isoformat() if self.creation_date else None,
            "volume_liters": float(self.volume_liters) if self.volume_liters else None,
            "notes": self.notes,
            "recipeMalts": [malt.to_dict() for malt in self.malts]
        }

class RecipeMalt(db.Model):
    __tablename__ = 'recipe_malts'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    color_degrees_lovibond = db.Column(db.Numeric(5, 2), nullable=False)
    potential_extract = db.Column(db.Numeric(5, 3), nullable=False)
    malt_type = db.Column(db.String(50))
    supplier = db.Column(db.String(100))
    unit_price = db.Column(db.Numeric(10, 2))
    notes = db.Column(db.Text)
    weight_grams = db.Column(db.Numeric)

    def to_dict(self):
        return {
            "id": self.id,
            "recipe_id": self.recipe_id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "color_degrees_lovibond": float(self.color_degrees_lovibond),
            "potential_extract": float(self.potential_extract),
            "malt_type": self.malt_type,
            "supplier": self.supplier,
            "unit_price": float(self.unit_price) if self.unit_price else None,
            "notes": self.notes,
            "weight_grams": self.weight_grams
        }

def create_recipes_bp():
    recipes_bp = Blueprint("recipes", __name__)

    #Return all records
    @recipes_bp.route("/recipes", methods=["GET"])
    @token_required
    def get_recipes(current_user_id):
        recipes = Recipe.query.filter_by(user_id=current_user_id).all()
        
        return jsonify([recipe.to_dict() for recipe in recipes])

    #Return a specific record
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

        # Adjustment to handle OPTIONS request errors
        def sanitize(value):
            return value if value != "" else None

        new_recipe = Recipe(
            name=data.get("name"),
            style=data.get("style"),
            description=data.get("description"),
            volume_liters=sanitize(data.get("volume_liters")),
            notes=data.get("notes"),
            user_id=current_user_id
        )
        db.session.add(new_recipe)
        db.session.flush()

        # Add associated malts
        malts_data = data.get("malts", [])
        for malt_data in malts_data:
            new_malt = RecipeMalt(
                recipe_id=new_recipe.id,
                user_id=current_user_id,
                name=malt_data["name"],
                description=malt_data.get("description"),
                color_degrees_lovibond=malt_data["color_degrees_lovibond"],
                potential_extract=malt_data["potential_extract"],
                malt_type=malt_data.get("malt_type"),
                supplier=malt_data.get("supplier"),
                unit_price=malt_data.get("unit_price"),
                notes=malt_data.get("notes"),
                weight_grams=malt_data.get("weight_grams")
            )
            db.session.add(new_malt)

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

        data = request.json
        recipe.name = data.get("name", recipe.name)
        recipe.style = data.get("style", recipe.style)
        recipe.description = data.get("description", recipe.description)
        recipe.volume_liters = data.get("volume_liters", recipe.volume_liters)
        recipe.notes = data.get("notes", recipe.notes)

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

        return jsonify({"message": f"Recipe deleted"}), 200

    return recipes_bp