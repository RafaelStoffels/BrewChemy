from flask import Blueprint, jsonify, request
from db import db
from models import Yeast
from AuthTokenVerifier import token_required
from marshmallow import ValidationError
from schemas.yeasts_schema import YeastsSchema

def create_yeasts_bp():
    yeasts_bp = Blueprint("yeasts", __name__)

    @yeasts_bp.route("/yeasts/search", methods=["GET"])
    @token_required
    def search_yeasts(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()

        if not search_term:
            return jsonify({"error": "Search term is required"}), 400

        subquery = db.session.query(Yeast.official_id).filter(
            Yeast.user_id == current_user_id,
            Yeast.official_id.isnot(None)
        ).distinct()

        subquery_list = [id for (id,) in subquery.all()]

        items = Yeast.query.filter(
            (
                (Yeast.user_id == current_user_id) |
                (
                    (Yeast.user_id == 1) &
                    (~Yeast.id.in_(subquery_list))
                )
            ) &
            (Yeast.name.ilike(f"%{search_term}%"))
        ).limit(12).all()

        return jsonify([item.to_dict() for item in items])

    @yeasts_bp.route("/yeasts", methods=["GET"])
    @token_required
    def get_yeasts(current_user_id):
        subquery = db.session.query(Yeast.official_id).filter(
            Yeast.user_id == current_user_id,
            Yeast.official_id.isnot(None)
        ).distinct()

        subquery_list = [id for (id,) in subquery.all()]

        items = Yeast.query.filter(
            (Yeast.user_id == current_user_id) |
            (
                (Yeast.user_id == 1) &
                (~Yeast.id.in_(subquery_list))
            )
        ).limit(12).all()

        return jsonify([item.to_dict() for item in items])

    @yeasts_bp.route("/yeasts/<int:itemUserId>/<int:id>", methods=["GET"])
    def get_yeast(itemUserId, id):
        item = Yeast.query.filter_by(id=id, user_id=itemUserId).first()

        if item is None:
            return jsonify({"message": "yeast not found"}), 404

        return jsonify(item.to_dict())

    @yeasts_bp.route("/yeasts", methods=["POST"])
    @token_required
    def add_yeast(current_user_id):
        schema = YeastsSchema()

        try:
            data = schema.load(request.json)
        except ValidationError as err:
            return jsonify({"errors": err.messages}), 400

        def sanitize(value):
            return value if value != "" else None

        new_yeast = Yeast(
            user_id=current_user_id,
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

    @yeasts_bp.route("/yeasts/<int:id>", methods=["PUT"])
    @token_required
    def update_yeast(current_user_id, id):
        schema = YeastsSchema()

        try:
            data = schema.load(request.json)
        except ValidationError as err:
            return jsonify({"errors": err.messages}), 400

        itemUserId = data.get("itemUserId")

        if itemUserId != current_user_id:
            official_item = Yeast.query.filter_by(id=id, user_id=1).first()

            if official_item is None:
                return jsonify({"message": "Official yeast not found"}), 404

            new_item = Yeast(
                user_id=current_user_id,
                official_id=id,
                name=official_item.name,
                manufacturer=official_item.manufacturer,
                type=official_item.type,
                form=official_item.form,
                attenuation=official_item.attenuation,
                temperature_range=official_item.temperature_range,
                alcohol_tolerance=official_item.alcohol_tolerance,
                flavor_profile=official_item.flavor_profile,
                flocculation=official_item.flocculation,
                description=official_item.description
            )
            
            new_item.name = data.get("name", new_item.name)
            new_item.manufacturer = data.get("manufacturer", new_item.manufacturer)
            new_item.type = data.get("type", new_item.type)
            new_item.form = data.get("form", new_item.form)
            new_item.attenuation = data.get("attenuation", new_item.attenuation)
            new_item.temperature_range = data.get("temperatureRange", new_item.temperature_range)
            new_item.alcohol_tolerance = data.get("alcoholTolerance", new_item.alcohol_tolerance)
            new_item.flavor_profile = data.get("flavorProfile", new_item.flavor_profile)
            new_item.flocculation = data.get("flocculation", new_item.flocculation)
            new_item.description = data.get("description", new_item.description)

            db.session.add(new_item)
            db.session.commit()

            return jsonify(new_item.to_dict()), 201
        else:
            item = Yeast.query.filter_by(id=id, user_id=current_user_id).first()

            if item is None:
                return jsonify({"message": "Yeast not found"}), 404

            item.name = data.get("name", item.name)
            item.manufacturer = data.get("manufacturer", item.manufacturer)
            item.type = data.get("type", item.type)
            item.form = data.get("form", item.form)
            item.attenuation = data.get("attenuation", item.attenuation)
            item.temperature_range = data.get("temperatureRange", item.temperature_range)
            item.alcohol_tolerance = data.get("alcoholTolerance", item.alcohol_tolerance)
            item.flavor_profile = data.get("flavorProfile", item.flavor_profile)
            item.flocculation = data.get("flocculation", item.flocculation)
            item.description = data.get("description", item.description)

            db.session.commit()

            return jsonify(item.to_dict()), 200

    @yeasts_bp.route("/yeasts/<int:itemUserId>/<int:id>", methods=["DELETE"])
    @token_required
    def delete_yeast(current_user_id, itemUserId, id):
        if itemUserId != current_user_id:
            return jsonify({"message": "Cannot delete official record"}), 404

        yeast = Yeast.query.filter_by(id=id).first()

        if yeast is None:
            return jsonify({"message": "Yeast not found"}), 404

        db.session.delete(yeast)
        db.session.commit()

        return jsonify({"message": f"Yeast with ID {id} was successfully deleted"}), 200

    return yeasts_bp
