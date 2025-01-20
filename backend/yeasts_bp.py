from flask import Blueprint, jsonify, request
from db import db
from AuthTokenVerifier import token_required

class Yeast(db.Model):
    __tablename__ = 'yeasts'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    manufacturer = db.Column(db.String(100))
    type = db.Column(db.String(50))
    form = db.Column(db.String(50))
    attenuation_range = db.Column(db.String(50))
    temperature_range = db.Column(db.String(50))
    alcohol_tolerance = db.Column(db.String(50))
    flavor_profile = db.Column(db.String(100))
    flocculation = db.Column(db.String(50))
    description = db.Column(db.Text)
    notes = db.Column(db.Text)

    # Convert snake_case to camelCase in JSON
    def to_dict(self):
        return {
            "id": self.id,
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
            "notes": self.notes,
        }
    
class YeastOfficial(db.Model):
    __tablename__ = 'yeasts_official'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    manufacturer = db.Column(db.String(100))
    type = db.Column(db.String(50))
    form = db.Column(db.String(50))
    attenuation_range = db.Column(db.String(50))
    temperature_range = db.Column(db.String(50))
    alcohol_tolerance = db.Column(db.String(50))
    flavor_profile = db.Column(db.String(100))
    flocculation = db.Column(db.String(50))
    description = db.Column(db.Text)
    notes = db.Column(db.Text)

    # Convert snake_case to camelCase in JSON
    def to_dict(self):
        return {
            "id": self.id,
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
            "notes": self.notes,
        }

def create_yeasts_bp():
    yeasts_bp = Blueprint("yeasts", __name__)

    # Return all yeasts
    @yeasts_bp.route("/yeasts", methods=["GET"])
    @token_required
    def get_yeasts(current_user_id):
        official_yeasts = YeastOfficial.query.all()

        return jsonify([yeast.to_dict() for yeast in official_yeasts])

    # Return a specific yeast
    @yeasts_bp.route("/yeasts/<int:id>", methods=["GET"])
    @token_required
    def get_yeast(current_user_id, id):
        yeast = Yeast.query.filter_by(id=id).first()

        if yeast is None:
            return jsonify({"message": "Yeast not found"}), 404

        return jsonify(yeast.to_dict())

    # Add a new yeast
    @yeasts_bp.route("/yeasts", methods=["POST"])
    @token_required
    def add_yeast(current_user_id):
        data = request.json

        # Adjustment to handle empty values
        def sanitize(value):
            return value if value != "" else None

        new_yeast = Yeast(
            name=data.get("name"),
            manufacturer=sanitize(data.get("manufacturer")),
            type=sanitize(data.get("type")),
            form=sanitize(data.get("form")),
            attenuation_range=sanitize(data.get("attenuationRange")),
            temperature_range=sanitize(data.get("temperatureRange")),
            alcohol_tolerance=sanitize(data.get("alcoholTolerance")),
            flavor_profile=sanitize(data.get("flavorProfile")),
            flocculation=sanitize(data.get("flocculation")),
            description=sanitize(data.get("description")),
            notes=sanitize(data.get("notes"))
        )
        db.session.add(new_yeast)
        db.session.commit()
        return jsonify(new_yeast.to_dict()), 201

    # Update a yeast
    @yeasts_bp.route("/yeasts/<int:id>", methods=["PUT"])
    @token_required
    def update_yeast(current_user_id, id):
        yeast = Yeast.query.filter_by(id=id).first()

        if yeast is None:
            return jsonify({"message": "Yeast not found"}), 404

        data = request.json

        yeast.name = data.get("name", yeast.name)
        yeast.manufacturer = data.get("manufacturer", yeast.manufacturer)
        yeast.type = data.get("type", yeast.type)
        yeast.form = data.get("form", yeast.form)
        yeast.attenuation_range = data.get("attenuationRange", yeast.attenuation_range)
        yeast.temperature_range = data.get("temperatureRange", yeast.temperature_range)
        yeast.alcohol_tolerance = data.get("alcoholTolerance", yeast.alcohol_tolerance)
        yeast.flavor_profile = data.get("flavorProfile", yeast.flavor_profile)
        yeast.flocculation = data.get("flocculation", yeast.flocculation)
        yeast.description = data.get("description", yeast.description)
        yeast.notes = data.get("notes", yeast.notes)

        db.session.commit()

        return jsonify(yeast.to_dict()), 200

    # Delete a yeast
    @yeasts_bp.route("/yeasts/<int:id>", methods=["DELETE"])
    @token_required
    def delete_yeast(current_user_id, id):
        yeast = Yeast.query.filter_by(id=id).first()

        if yeast is None:
            return jsonify({"message": "Yeast not found"}), 404

        db.session.delete(yeast)
        db.session.commit()

        return jsonify({"message": f"Yeast with ID {id} was successfully deleted"}), 200

    return yeasts_bp