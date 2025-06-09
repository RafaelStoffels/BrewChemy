from flask import Blueprint, jsonify, request
from db import db
from models import Fermentable
from AuthTokenVerifier import token_required
from marshmallow import ValidationError
from schemas.fermentables_schema import FermentablesSchema

def create_fermentables_bp():
    fermentables_bp = Blueprint("fermentables", __name__)

    @fermentables_bp.route("/fermentables/search", methods=["GET"])
    @token_required
    def search_fermentables(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()

        if not search_term:
            return jsonify({"error": "Search term is required"}), 400

        subquery = db.session.query(Fermentable.official_id).filter(
            Fermentable.user_id == current_user_id,
            Fermentable.official_id.isnot(None)
        ).distinct()

        subquery_list = [id for (id,) in subquery.all()]

        items = Fermentable.query.filter(
            (
                (Fermentable.user_id == current_user_id) |
                (
                    (Fermentable.user_id == 1) &
                    (~Fermentable.id.in_(subquery_list))
                )
            ) &
            (Fermentable.name.ilike(f"%{search_term}%"))
        ).limit(12).all()

        return jsonify([item.to_dict() for item in items])

    @fermentables_bp.route("/fermentables", methods=["GET"])
    @token_required
    def get_fermentables(current_user_id):

        subquery = db.session.query(Fermentable.official_id).filter(
            Fermentable.user_id == current_user_id,
            Fermentable.official_id.isnot(None)
        ).distinct()

        subquery_list = [id for (id,) in subquery.all()]
        print("Subquery list (sem NULL):", subquery_list)

        items = Fermentable.query.filter(
            (Fermentable.user_id == current_user_id) |
            (
                (Fermentable.user_id == 1) &
                (~Fermentable.id.in_(subquery_list))
            )
        ).limit(12).all()

        return jsonify([item.to_dict() for item in items])

    @fermentables_bp.route("/fermentables/<int:itemUserId>/<int:id>", methods=["GET"])
    def get_fermentable(itemUserId, id):
        item = Fermentable.query.filter_by(id=id, user_id=itemUserId).first()

        if item is None:
            return jsonify({"message": "fermentable not found"}), 404

        return jsonify(item.to_dict())

    @fermentables_bp.route("/fermentables", methods=["POST"])
    @token_required
    def add_fermentable(current_user_id):
        schema = FermentablesSchema()

        try:
            data = schema.load(request.json)
        except ValidationError as err:
            print(err.messages)
            return jsonify({"errors": err.messages}), 400

        def sanitize(value):
            return value if value != "" else None

        new_fermentable = Fermentable(
            name=data.get("name"),
            description=data.get("description"),
            ebc=sanitize(data.get("ebc")),
            potential_extract=sanitize(data.get("potentialExtract")),
            type=data.get("type"),
            supplier=data.get("supplier"),
            user_id=current_user_id,
            official_id=data.get("officialId")
        )
        db.session.add(new_fermentable)
        db.session.commit()
        return jsonify(new_fermentable.to_dict()), 201

    @fermentables_bp.route("/fermentables/<int:id>", methods=["PUT"])
    @token_required
    def update_equipment(current_user_id, id):
        schema = FermentablesSchema()

        try:
            data = schema.load(request.json)
        except ValidationError as err:
            return jsonify({"errors": err.messages}), 400

        itemUserId = data.get("itemUserId")

        if itemUserId != current_user_id:
            official_item = Fermentable.query.filter_by(id=id, user_id=1).first()

            if official_item is None:
                return jsonify({"message": "Official fermentable not found"}), 404

            new_item = Fermentable(
                user_id=current_user_id,
                official_id=id,
                name=official_item.name,
                description=official_item.description,
                ebc=official_item.ebc,
                potential_extract=official_item.potential_extract,
                type=official_item.type,
                supplier=official_item.supplier
            )
            
            new_item.name = data.get("name", new_item.name)
            new_item.description = data.get("description", new_item.description)
            new_item.ebc = data.get("ebc", new_item.ebc)
            new_item.potential_extract = data.get("potentialExtract", new_item.potential_extract)
            new_item.type = data.get("type", new_item.type)
            new_item.supplier = data.get("supplier", new_item.supplier)

            db.session.add(new_item)
            db.session.commit()

            return jsonify(new_item.to_dict()), 201

        else:
            item = Fermentable.query.filter_by(id=id, user_id=current_user_id).first()

            if item is None:
                return jsonify({"message": "Fermentable not found"}), 404

            item.name = data.get("name", item.name)
            item.description = data.get("description", item.description)
            item.ebc = data.get("ebc", item.ebc)
            item.potential_extract = data.get("potentialExtract", item.potential_extract)
            item.type = data.get("type", item.type)
            item.supplier = data.get("supplier", item.supplier)

            db.session.commit()

            return jsonify(item.to_dict()), 200

    @fermentables_bp.route("/fermentables/<int:itemUserId>/<int:id>", methods=["DELETE"])
    @token_required
    def delete_fermentable(current_user_id, itemUserId, id):
        if itemUserId != current_user_id:
            return jsonify({"message": "Cannot delete official record"}), 404

        fermentable = Fermentable.query.filter_by(id=id, user_id=current_user_id).first()

        if fermentable is None:
            return jsonify({"message": "Fermentable not found"}), 404

        db.session.delete(fermentable)
        db.session.commit()

        return jsonify({"message": f"Fermentable with ID {id} was successfully deleted"}), 200

    return fermentables_bp
