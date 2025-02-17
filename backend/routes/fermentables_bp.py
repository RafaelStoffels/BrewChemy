from flask import Blueprint, jsonify, request
from db import db
from models import Fermentable
from AuthTokenVerifier import token_required


def create_fermentables_bp():
    fermentables_bp = Blueprint("fermentables", __name__)

    @fermentables_bp.route("/fermentables/search", methods=["GET"])
    @token_required
    def search_fermentables(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()

        if not search_term:
            return jsonify({"error": "O parâmetro 'searchTerm' é obrigatório."}), 400

        user_fermentables = Fermentable.query.filter(
            Fermentable.user_id == current_user_id,
            Fermentable.name.ilike(f"%{search_term}%"),
            Fermentable.official_fermentable_id.is_(None)
        ).all()

        return jsonify([fermentable.to_dict() for fermentable in user_fermentables])


    @fermentables_bp.route("/fermentables", methods=["GET"])
    @token_required
    def get_fermentables(current_user_id):

        source = request.args.get("source", "all") 
        
        print(source)

        if source == "custom":

            user_fermentables = Fermentable.query.filter(
                Fermentable.user_id == current_user_id
            ).all()
            return jsonify([fermentable.to_dict() for fermentable in user_fermentables])

        elif source == "official":

            official_fermentables = Fermentable.query.filter(
                Fermentable.user_id == 1
            ).all()
            return jsonify([fermentable.to_dict() for fermentable in official_fermentables])

        elif source == "all":

            all_fermentables = Fermentable.query.filter(
                (Fermentable.user_id == current_user_id) | (Fermentable.user_id == 1)
            ).all()
            return jsonify([fermentable.to_dict() for fermentable in all_fermentables])

        else:
            return jsonify({"error": "Parâmetro 'source' inválido. Use 'custom', 'official' ou 'all'."}), 400


    @fermentables_bp.route("/fermentables/<int:id>", methods=["GET"])
    @token_required
    def get_fermentable(current_user_id, id):

        source = request.args.get("source", "custom")

        if source == "custom":

            fermentable = Fermentable.query.filter_by(id=id, user_id=current_user_id).first()
            if fermentable is None:
                return jsonify({"message": "Fermentable not found in custom data"}), 404
            return jsonify(fermentable.to_dict())

        elif source == "official":

            fermentable = Fermentable.query.filter_by(id=id, user_id=0).first()
            if fermentable is None:
                return jsonify({"message": "Fermentable not found in official data"}), 404
            return jsonify(fermentable.to_dict())

        else:
            return jsonify({"error": "Invalid 'source' parameter. Use 'custom' or 'official'."}), 400


    @fermentables_bp.route("/fermentables", methods=["POST"])
    @token_required
    def add_fermentable(current_user_id):
        data = request.json

        def sanitize(value):
            return value if value != "" else None

        new_fermentable = Fermentable(
            name=data.get("name"),
            description=data.get("description"),
            ebc=sanitize(data.get("ebc")),
            potential_extract=sanitize(data.get("potentialExtract")),
            malt_type=data.get("maltType"),
            supplier=data.get("supplier"),
            user_id=current_user_id,
            official_fermentable_id=data.get("officialFermentableId")
        )
        db.session.add(new_fermentable)
        db.session.commit()
        return jsonify(new_fermentable.to_dict()), 201


    @fermentables_bp.route("/fermentables/<int:id>", methods=["PUT"])
    @token_required
    def update_fermentable(current_user_id, id):
        fermentable = Fermentable.query.filter_by(id=id, user_id=current_user_id).first()
        
        if fermentable is None:
            return jsonify({"message": "Fermentable not found"}), 404

        data = request.json

        fermentable.name = data.get("name", fermentable.name)
        fermentable.description = data.get("description", fermentable.description)
        fermentable.ebc = data.get("ebc", fermentable.ebc)
        fermentable.potential_extract = data.get("potentialExtract", fermentable.potential_extract)
        fermentable.malt_type = data.get("maltType", fermentable.malt_type)
        fermentable.supplier = data.get("supplier", fermentable.supplier)

        db.session.commit()

        return jsonify(fermentable.to_dict()), 200


    @fermentables_bp.route("/fermentables/<int:id>", methods=["DELETE"])
    @token_required
    def delete_fermentable(current_user_id, id):
        fermentable = Fermentable.query.filter_by(id=id, user_id=current_user_id).first()
        
        if fermentable is None:
            return jsonify({"message": "Fermentable not found"}), 404

        db.session.delete(fermentable)
        db.session.commit()

        return jsonify({"message": f"Fermentable with ID {id} was successfully deleted"}), 200

    return fermentables_bp
