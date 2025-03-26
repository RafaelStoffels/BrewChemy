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
            return jsonify({"error": "Search term is required"}), 400
        
        # Subquery para encontrar fermentáveis do usuário atual
        subquery = db.session.query(Misc.official_id).filter(
            Misc.user_id == current_user_id,
            Misc.official_id.isnot(None)  # Evita incluir valores NULL
        ).distinct()
        
        subquery_list = [id for (id,) in subquery.all()]
        print("Subquery list (sem NULL):", subquery_list)
        
        # Busca fermentáveis que correspondam ao termo de pesquisa
        items = Misc.query.filter(
            (
                (Misc.user_id == current_user_id) |  # Pega fermentáveis do usuário
                (
                    (Misc.user_id == 1) &  # Apenas fermentáveis oficiais
                    (~Misc.id.in_(subquery_list))  # Exclui os personalizados
                )
            ) &
            (Misc.name.ilike(f"%{search_term}%"))  # Filtra pelo nome
        ).limit(12).all()
        
        return jsonify([item.to_dict() for item in items])

    # Return all misc items
    @misc_bp.route("/misc", methods=["GET"])
    @token_required
    def get_miscs(current_user_id):
        # filtra todos os registro com official id do usuario corrente
        subquery = db.session.query(Misc.official_id).filter(
            Misc.user_id == current_user_id,
            Misc.official_id.isnot(None)  # Evita incluir valores NULL
        ).distinct()
        
        # Exibir os resultados da subquery para debug
        subquery_list = [id for (id,) in subquery.all()]
        print("Subquery list (sem NULL):", subquery_list)
        
        # Buscar os fermentáveis considerando a lógica correta
        items = Misc.query.filter(
            (Misc.user_id == current_user_id) |  # Pega os fermentáveis do usuário atual
            (
                (Misc.user_id == 1) &  # Apenas fermentáveis oficiais
                (~Misc.id.in_(subquery_list))  # Exclui aqueles que já foram personalizados
            )
        ).limit(12).all()
        
        # Retorna os dados formatados como JSON
        return jsonify([item.to_dict() for item in items])

    # Return a specific misc item
    @misc_bp.route("/misc/<int:recordUserId>/<int:id>", methods=["GET"])
    def get_misc(recordUserId, id):
        item = Misc.query.filter_by(id=id, user_id=recordUserId).first()
        
        if item is None:
            return jsonify({"message": "misc not found"}), 404

        return jsonify(item.to_dict())

    # Add a new misc item
    @misc_bp.route("/misc", methods=["POST"])
    @token_required
    def add_misc_item(current_user_id):
        data = request.json

        # Adjustment to handle OPTIONS request errors
        def sanitize(value):
            return value if value != "" else None

        new_misc = Misc(
            user_id=current_user_id,
            name=data.get("name"),
            description=data.get("description"),
            type=data.get("type")
        )
        db.session.add(new_misc)
        db.session.commit()
        return jsonify(new_misc.to_dict()), 201

    # Update a misc item
    @misc_bp.route("/misc/<int:recordUserId>/<int:id>", methods=["PUT"])
    @token_required
    def update_misc(current_user_id, recordUserId, id):

        # Caso o current_user_id seja diferente do recordUserId, cria-se um novo registro
        if recordUserId != current_user_id:
            # Encontrar o misc oficial (user_id = 1)
            official_item = Misc.query.filter_by(id=id, user_id=1).first()

            if official_item is None:
                return jsonify({"message": "Official misc item not found"}), 404

            # Criar um novo registro para o current_user_id baseado no misc oficial
            new_item = Misc(
                user_id=current_user_id,
                official_id=id,  # Associar ao ID oficial
                name=official_item.name,
                description=official_item.description,
                type=official_item.type
            )

            # Atualizar os dados do novo misc com os valores fornecidos, se existirem
            data = request.json
            new_item.name = data.get("name", new_item.name)
            new_item.description = data.get("description", new_item.description)
            new_item.type = data.get("type", new_item.type)

            # Adicionar o novo misc e confirmar a transação
            db.session.add(new_item)
            db.session.commit()

            return jsonify(new_item.to_dict()), 201  # Retornar o novo registro criado

        else:
            # Caso current_user_id e recordUserId sejam iguais, apenas atualiza o registro
            item = Misc.query.filter_by(id=id, user_id=current_user_id).first()

            if item is None:
                return jsonify({"message": "Misc item not found"}), 404

            data = request.json

            item.name = data.get("name", item.name)
            item.description = data.get("description", item.description)
            item.type = data.get("type", item.type)

            db.session.commit()

            return jsonify(item.to_dict()), 200  # Retornar o registro atualizado

    # Delete a misc item
    @misc_bp.route("/misc/<int:recordUserId>/<int:id>", methods=["DELETE"])
    @token_required
    def delete_misc_item(current_user_id, recordUserId, id):
        if recordUserId != current_user_id:
            return jsonify({"message": "Cannot delete official record"}), 404

        misc_item = Misc.query.filter_by(id=id).first()

        if misc_item is None:
            return jsonify({"message": "Misc item not found"}), 404

        db.session.delete(misc_item)
        db.session.commit()

        return jsonify({"message": f"Misc item with ID {id} was successfully deleted"}), 200

    return misc_bp
