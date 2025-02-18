from flask import Blueprint, jsonify, request
from db import db
from models import Yeast
from AuthTokenVerifier import token_required


def create_yeasts_bp():
    yeasts_bp = Blueprint("yeasts", __name__)

    @yeasts_bp.route("/yeasts/search", methods=["GET"])
    @token_required
    def search_yeasts(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()

        if not search_term:
            return jsonify({"error": "O parâmetro 'searchTerm' é obrigatório."}), 400

        user_yeasts = Yeast.query.filter(
            (Yeast.user_id == current_user_id) | (Yeast.user_id == 1),
            Yeast.name.ilike(f"%{search_term}%")
        ).all()

        return jsonify([yeast.to_dict() for yeast in user_yeasts])

    # Return all yeasts
    @yeasts_bp.route("/yeasts", methods=["GET"])
    @token_required
    def get_yeasts(current_user_id):
        source = request.args.get("source", "all") 
        
        print(source)

        if source == "custom":

            user_yeasts = Yeast.query.filter(
                Yeast.user_id == current_user_id
            ).all()
            return jsonify([yeast.to_dict() for yeast in user_yeasts])

        elif source == "official":

            official_yeasts = Yeast.query.filter(
                Yeast.user_id == 1
            ).all()
            return jsonify([yeast.to_dict() for yeast in official_yeasts])

        elif source == "all":

            all_yeasts = Yeast.query.filter(
                (Yeast.user_id == current_user_id) | (Yeast.user_id == 1)
            ).all()
            return jsonify([yeast.to_dict() for yeast in all_yeasts])

        else:
            return jsonify({"error": "Parâmetro 'source' inválido. Use 'custom', 'official' ou 'all'."}), 400

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
            attenuation=sanitize(data.get("attenuation")),
            temperature_range=sanitize(data.get("temperatureRange")),
            alcohol_tolerance=sanitize(data.get("alcoholTolerance")),
            flavor_profile=sanitize(data.get("flavorProfile")),
            flocculation=sanitize(data.get("flocculation")),
            description=sanitize(data.get("description")),
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
        yeast.attenuation = data.get("attenuation", yeast.attenuation)
        yeast.temperature_range = data.get("temperatureRange", yeast.temperature_range)
        yeast.alcohol_tolerance = data.get("alcoholTolerance", yeast.alcohol_tolerance)
        yeast.flavor_profile = data.get("flavorProfile", yeast.flavor_profile)
        yeast.flocculation = data.get("flocculation", yeast.flocculation)
        yeast.description = data.get("description", yeast.description)

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