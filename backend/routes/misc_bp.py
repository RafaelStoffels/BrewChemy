from flask import Blueprint, jsonify, request
from db import db
from models import Misc
from AuthTokenVerifier import token_required


def create_misc_bp():
    misc_bp = Blueprint("misc", __name__)

    @misc_bp.route("/miscs/search", methods=["GET"])
    @token_required
    def search_miscs(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()

        if not search_term:
            return jsonify({"error": "O parâmetro 'searchTerm' é obrigatório."}), 400

        # Consulta nas duas tabelas usando filtro por nome
        user_miscs = Misc.query.filter(
            Misc.user_id == current_user_id,
            Misc.name.ilike(f"%{search_term}%")
        ).all()
    """
        official_miscs = MiscOfficial.query.filter(
            MiscOfficial.name.ilike(f"%{search_term}%")
        ).all()

        # Combina os resultados
        combined_miscs = [misc.to_dict() for misc in user_miscs] + \
                         [misc.to_dict() for misc in official_miscs]
    
        return jsonify(combined_miscs)
    """

    # Return all misc items
    @misc_bp.route("/misc", methods=["GET"])
    @token_required
    def get_misc(current_user_id):
        source = request.args.get("source", "all") 
        
        print(source)

        if source == "custom":

            user_miscs = Misc.query.filter(
                Misc.user_id == current_user_id
            ).all()
            return jsonify([misc.to_dict() for misc in user_miscs])

        elif source == "official":

            official_miscs = Misc.query.filter(
                Misc.user_id == 1
            ).all()
            return jsonify([misc.to_dict() for misc in official_miscs])

        elif source == "all":

            all_miscs = Misc.query.filter(
                (Misc.user_id == current_user_id) | (Misc.user_id == 1)
            ).all()
            return jsonify([misc.to_dict() for misc in all_miscs])

        else:
            return jsonify({"error": "Parâmetro 'source' inválido. Use 'custom', 'official' ou 'all'."}), 400

    # Return a specific misc item
    @misc_bp.route("/misc/<int:id>", methods=["GET"])
    @token_required
    def get_misc_item(current_user_id, id):
        source = request.args.get("source", "custom")  # Padrão é 'custom'
        if source == "custom":
            # Busca apenas na tabela 'misc'
            misc = Misc.query.filter_by(id=id, user_id=current_user_id).first()
            if misc is None:
                return jsonify({"message": "Misc not found in custom data"}), 404
            return jsonify(misc.to_dict())
        """
        elif source == "official":
            # Busca apenas na tabela 'fermentables_official'
            misc = MiscOfficial.query.filter_by(id=id).first()
            if misc is None:
                return jsonify({"message": "Misc not found in official data"}), 404
            return jsonify(misc.to_dict())

        else:
            # Parâmetro 'source' inválido
            return jsonify({"error": "Invalid 'source' parameter. Use 'custom' or 'official'."}), 400
        """
    # Add a new misc item
    @misc_bp.route("/misc", methods=["POST"])
    @token_required
    def add_misc_item(current_user_id):
        data = request.json

        # Adjustment to handle OPTIONS request errors
        def sanitize(value):
            return value if value != "" else None

        new_misc = Misc(
            name=data.get("name"),
            description=data.get("description"),
            type=data.get("type")
        )
        db.session.add(new_misc)
        db.session.commit()
        return jsonify(new_misc.to_dict()), 201

    # Update a misc item
    @misc_bp.route("/misc/<int:id>", methods=["PUT"])
    @token_required
    def update_misc_item(current_user_id, id):
        misc_item = Misc.query.filter_by(id=id).first()

        if misc_item is None:
            return jsonify({"message": "Misc item not found"}), 404

        data = request.json

        misc_item.name = data.get("name", misc_item.name)
        misc_item.description = data.get("description", misc_item.description)
        misc_item.type = data.get("type", misc_item.type)

        db.session.commit()

        return jsonify(misc_item.to_dict()), 200

    # Delete a misc item
    @misc_bp.route("/misc/<int:id>", methods=["DELETE"])
    @token_required
    def delete_misc_item(current_user_id, id):
        misc_item = Misc.query.filter_by(id=id).first()

        if misc_item is None:
            return jsonify({"message": "Misc item not found"}), 404

        db.session.delete(misc_item)
        db.session.commit()

        return jsonify({"message": f"Misc item with ID {id} was successfully deleted"}), 200

    return misc_bp
