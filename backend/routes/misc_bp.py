from flask import Blueprint, jsonify, request
from db import db
from models import Misc
from AuthTokenVerifier import token_required
from marshmallow import ValidationError
from schemas.miscs_schema import MiscsSchema
import logging

def create_misc_bp():
    misc_bp = Blueprint("misc", __name__)

    logging.basicConfig(level=logging.INFO)

    @misc_bp.route("/miscs/search", methods=["GET"])
    @token_required
    def search_miscs(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()

        if not search_term:
            return jsonify({"error": "Search term is required"}), 400

        subquery = db.session.query(Misc.official_id).filter(
            Misc.user_id == current_user_id,
            Misc.official_id.isnot(None)
        ).distinct()

        subquery_list = [id for (id,) in subquery.all()]
        print("Subquery list (sem NULL):", subquery_list)

        items = Misc.query.filter(
            (
                (Misc.user_id == current_user_id) |
                (
                    (Misc.user_id == 1) &
                    (~Misc.id.in_(subquery_list))
                )
            ) &
            (Misc.name.ilike(f"%{search_term}%"))
        ).limit(12).all()

        return jsonify([item.to_dict() for item in items])

    @misc_bp.route("/miscs", methods=["GET"])
    @token_required
    def get_miscs(current_user_id):
        subquery = db.session.query(Misc.official_id).filter(
            Misc.user_id == current_user_id,
            Misc.official_id.isnot(None)
        ).distinct()

        subquery_list = [id for (id,) in subquery.all()]

        items = Misc.query.filter(
            (Misc.user_id == current_user_id) |
            (
                (Misc.user_id == 1) &
                (~Misc.id.in_(subquery_list))
            )
        ).limit(12).all()

        return jsonify([item.to_dict() for item in items])

    @misc_bp.route("/miscs/<int:itemUserId>/<int:id>", methods=["GET"])
    def get_misc(itemUserId, id):
        item = Misc.query.filter_by(id=id, user_id=itemUserId).first()

        if item is None:
            return jsonify({"message": "misc not found"}), 404

        return jsonify(item.to_dict())

    @misc_bp.route("/miscs", methods=["POST"])
    @token_required
    def add_misc_item(current_user_id):
        schema = MiscsSchema()

        try:
            data = schema.load(request.json)
        except ValidationError as err:
            return jsonify({"errors": err.messages}), 400

        new_misc = Misc(
            user_id=current_user_id,
            name=data.get("name"),
            description=data.get("description"),
            type=data.get("type")
        )
        db.session.add(new_misc)
        db.session.commit()
        return jsonify(new_misc.to_dict()), 201

    @misc_bp.route("/miscs/<int:id>", methods=["PUT"])
    @token_required
    def update_misc(current_user_id, id):
        schema = MiscsSchema()

        try:
            data = schema.load(request.json)
        except ValidationError as err:
            return jsonify({"errors": err.messages}), 400

        itemUserId = data.get("itemUserId")

        if itemUserId != current_user_id:
            official_item = Misc.query.filter_by(id=id, user_id=1).first()

            if official_item is None:
                return jsonify({"message": "Official misc item not found"}), 404

            new_item = Misc(
                user_id=current_user_id,
                official_id=id,
                name=official_item.name,
                description=official_item.description,
                type=official_item.type
            )
            
            new_item.name = data.get("name", new_item.name)
            new_item.description = data.get("description", new_item.description)
            new_item.type = data.get("type", new_item.type)

            db.session.add(new_item)
            db.session.commit()

            return jsonify(new_item.to_dict()), 201
        else:
            item = Misc.query.filter_by(id=id, user_id=current_user_id).first()

            if item is None:
                return jsonify({"message": "Misc item not found"}), 404

            item.name = data.get("name", item.name)
            item.description = data.get("description", item.description)
            item.type = data.get("type", item.type)

            db.session.commit()

            return jsonify(item.to_dict()), 200

    @misc_bp.route("/miscs/<int:itemUserId>/<int:id>", methods=["DELETE"])
    @token_required
    def delete_misc_item(current_user_id, itemUserId, id):

        if itemUserId != current_user_id:
            return jsonify({"message": "Cannot delete official record"}), 404

        misc_item = Misc.query.filter_by(id=id).first()

        if misc_item is None:
            return jsonify({"message": "Misc item not found"}), 404

        db.session.delete(misc_item)
        db.session.commit()

        return jsonify({"message": f"Misc item with ID {id} was successfully deleted"}), 200

    return misc_bp
