from flask import Blueprint, jsonify, request
from db import db
from models import Hop
from AuthTokenVerifier import token_required


def create_hops_bp():
    hops_bp = Blueprint("hops", __name__)

    @hops_bp.route("/hops/search", methods=["GET"])
    @token_required
    def search_hops(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()

        if not search_term:
            return jsonify({"error": "O parâmetro 'searchTerm' é obrigatório."}), 400
        """
        user_hops = Hop.query.filter(
            Hop.user_id == current_user_id,
            Hop.name.ilike(f"%{search_term}%"),
            Hop.official_hop_id.is_(None)
        ).all()
    
        return jsonify([hop.to_dict() for hop in user_hops])"""


    @hops_bp.route("/hops", methods=["GET"])
    @token_required
    def get_hops(current_user_id):
        source = request.args.get("source", "all") 
        
        print(source)

        if source == "custom":

            user_hops = Hop.query.filter(
                Hop.user_id == current_user_id
            ).all()
            return jsonify([hop.to_dict() for hop in user_hops])

        elif source == "official":

            official_hops = Hop.query.filter(
                Hop.user_id == 1
            ).all()
            return jsonify([hop.to_dict() for hop in official_hops])

        elif source == "all":

            all_hops = Hop.query.filter(
                (Hop.user_id == current_user_id) | (Hop.user_id == 1)
            ).all()
            return jsonify([hop.to_dict() for hop in all_hops])

        else:
            return jsonify({"error": "Parâmetro 'source' inválido. Use 'custom', 'official' ou 'all'."}), 400


    @hops_bp.route("/hops/<int:id>", methods=["GET"])
    @token_required
    def get_hop(current_user_id, id):
        hop = Hop.query.filter_by(id=id).first()

        if hop is None:
            return jsonify({"message": "Hop not found"}), 404

        return jsonify(hop.to_dict())


    @hops_bp.route("/hops", methods=["POST"])
    @token_required
    def add_hop(current_user_id):
        data = request.json

        def sanitize(value):
            return value if value != "" else None

        new_hop = Hop(
            name=data.get("name"),
            alpha_acid_content=sanitize(data.get("alphaAcidContent")),
            beta_acid_content=sanitize(data.get("betaAcidContent")),
            type=data.get("type"),
            country_of_origin=data.get("countryOfOrigin"),
            description=data.get("description")
        )
        db.session.add(new_hop)
        db.session.commit()
        return jsonify(new_hop.to_dict()), 201


    @hops_bp.route("/hops/<int:id>", methods=["PUT"])
    @token_required
    def update_hop(current_user_id, id):
        hop = Hop.query.filter_by(id=id).first()

        if hop is None:
            return jsonify({"message": "Hop not found"}), 404

        data = request.json

        hop.name = data.get("name", hop.name)
        hop.alpha_acid_content = data.get("alphaAcidContent", hop.alpha_acid_content)
        hop.beta_acid_content = data.get("betaAcidContent", hop.beta_acid_content)
        hop.type = data.get("type", hop.type)
        hop.country_of_origin = data.get("countryOfOrigin", hop.country_of_origin)
        hop.description = data.get("description", hop.description)

        db.session.commit()

        return jsonify(hop.to_dict()), 200


    @hops_bp.route("/hops/<int:id>", methods=["DELETE"])
    @token_required
    def delete_hop(current_user_id, id):
        hop = Hop.query.filter_by(id=id).first()

        if hop is None:
            return jsonify({"message": "Hop not found"}), 404

        db.session.delete(hop)
        db.session.commit()

        return jsonify({"message": f"Hop with ID {id} was successfully deleted"}), 200

    return hops_bp