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
            (Fermentable.user_id == current_user_id) | (Fermentable.user_id == 1),
            Fermentable.name.ilike(f"%{search_term}%")
        ).all()

        return jsonify([fermentable.to_dict() for fermentable in user_fermentables])


    @fermentables_bp.route("/fermentables", methods=["GET"])
    @token_required
    def get_fermentables(current_user_id):
        # filtra todos os registro com official id do usuario corrente
        subquery = db.session.query(Fermentable.official_id).filter(
            Fermentable.user_id == current_user_id,
            Fermentable.official_id.isnot(None)  # Evita incluir valores NULL
        ).distinct()
        
        # Exibir os resultados da subquery para debug
        subquery_list = [id for (id,) in subquery.all()]
        print("Subquery list (sem NULL):", subquery_list)
        
        # Buscar os fermentáveis considerando a lógica correta
        items = Fermentable.query.filter(
            (Fermentable.user_id == current_user_id) |  # Pega os fermentáveis do usuário atual
            (
                (Fermentable.user_id == 1) &  # Apenas fermentáveis oficiais
                (~Fermentable.id.in_(subquery_list))  # Exclui aqueles que já foram personalizados
            )
        ).limit(12).all()
        
        # Retorna os dados formatados como JSON
        return jsonify([item.to_dict() for item in items])


    @fermentables_bp.route("/fermentables/<int:recordUserId>/<int:id>", methods=["GET"])
    def get_fermentable(recordUserId, id):
        item = Fermentable.query.filter_by(id=id, user_id=recordUserId).first()
        
        if item is None:
            return jsonify({"message": "fermentable not found"}), 404

        return jsonify(item.to_dict())


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
            type=data.get("type"),
            supplier=data.get("supplier"),
            user_id=current_user_id,
            official_id=data.get("officialId")
        )
        db.session.add(new_fermentable)
        db.session.commit()
        return jsonify(new_fermentable.to_dict()), 201


    @fermentables_bp.route("/fermentables/<int:recordUserId>/<int:id>", methods=["PUT"])
    @token_required
    def update_equipment(current_user_id, recordUserId, id):

        # Caso o current_user_id seja diferente do recordUserId, cria-se um novo registro
        if recordUserId != current_user_id:
            # Encontrar o equipamento oficial (user_id = 1)
            official_item = Fermentable.query.filter_by(id=id, user_id=1).first()

            if official_item is None:
                return jsonify({"message": "Official fermentable not found"}), 404

            # Criar um novo registro para o current_user_id baseado no equipamento oficial
            new_item = Fermentable(
                user_id=current_user_id,
                official_id=id,  # Associar ao ID oficial
                name=official_item.name,
                description=official_item.description,
                ebc=official_item.ebc,
                potential_extract=official_item.potential_extract,
                type=official_item.type,
                supplier=official_item.supplier
            )

            # Atualizar os dados do novo equipamento com os valores fornecidos, se existirem
            data = request.json
            new_item.name = data.get("name", new_item.name)
            new_item.description = data.get("description", new_item.description)
            new_item.ebc = data.get("ebc", new_item.ebc)
            new_item.potential_extract = data.get("potentialExtract", new_item.potential_extract)
            new_item.type = data.get("type", new_item.type)
            new_item.supplier = data.get("supplier", new_item.supplier)

            # Adicionar o novo equipamento e confirmar a transação
            db.session.add(new_item)
            db.session.commit()

            return jsonify(new_item.to_dict()), 201  # Retornar o novo registro criado

        else:
            # Caso current_user_id e recordUserId sejam iguais, apenas atualiza o registro
            item = Fermentable.query.filter_by(id=id, user_id=current_user_id).first()

            if item is None:
                return jsonify({"message": "Fermentable not found"}), 404

            data = request.json

            item.name = data.get("name", item.name)
            item.description = data.get("description", item.description)
            item.ebc = data.get("ebc", item.ebc)
            item.potential_extract = data.get("potentialExtract", item.potential_extract)
            item.type = data.get("type", item.type)
            item.supplier = data.get("supplier", item.supplier)

            db.session.commit()

            return jsonify(item.to_dict()), 200  # Retornar o registro atualizado



    @fermentables_bp.route("/fermentables/<int:recordUserId>/<int:id>", methods=["DELETE"])
    @token_required
    def delete_fermentable(current_user_id, recordUserId, id):
        if recordUserId != current_user_id:
            return jsonify({"message": "Cannot delete official record"}), 404

        fermentable = Fermentable.query.filter_by(id=id, user_id=current_user_id).first()
        
        if fermentable is None:
            return jsonify({"message": "Fermentable not found"}), 404

        db.session.delete(fermentable)
        db.session.commit()

        return jsonify({"message": f"Fermentable with ID {id} was successfully deleted"}), 200

    return fermentables_bp
