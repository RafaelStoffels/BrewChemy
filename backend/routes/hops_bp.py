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

        user_hops = Hop.query.filter(
            (Hop.user_id == current_user_id) | (Hop.user_id == 1),
            Hop.name.ilike(f"%{search_term}%")
        ).all()

        return jsonify([hop.to_dict() for hop in user_hops])


    @hops_bp.route("/hops", methods=["GET"])
    @token_required
    def get_hops(current_user_id):
        # filtra todos os registro com official id do usuario corrente
        subquery = db.session.query(Hop.official_id).filter(
            Hop.user_id == current_user_id,
            Hop.official_id.isnot(None)  # Evita incluir valores NULL
        ).distinct()
        
        # Exibir os resultados da subquery para debug
        subquery_list = [id for (id,) in subquery.all()]
        print("Subquery list (sem NULL):", subquery_list)
        
        # Buscar os fermentáveis considerando a lógica correta
        items = Hop.query.filter(
            (Hop.user_id == current_user_id) |  # Pega os fermentáveis do usuário atual
            (
                (Hop.user_id == 1) &  # Apenas fermentáveis oficiais
                (~Hop.id.in_(subquery_list))  # Exclui aqueles que já foram personalizados
            )
        ).limit(12).all()
        
        # Retorna os dados formatados como JSON
        return jsonify([item.to_dict() for item in items])


    @hops_bp.route("/hops/<int:recordUserId>/<int:id>", methods=["GET"])
    def get_hop(recordUserId, id):
        item = Hop.query.filter_by(id=id, user_id=recordUserId).first()
        
        if item is None:
            return jsonify({"message": "hop not found"}), 404

        return jsonify(item.to_dict())


    @hops_bp.route("/hops", methods=["POST"])
    @token_required
    def add_hop(current_user_id):
        data = request.json

        def sanitize(value):
            return value if value != "" else None

        new_hop = Hop(
            user_id=current_user_id,
            name=data.get("name"),
            alpha_acid_content=sanitize(data.get("alphaAcidContent")),
            beta_acid_content=sanitize(data.get("betaAcidContent")),
            type=data.get("type"),
            use_type=data.get("useType"),
            country_of_origin=data.get("countryOfOrigin"),
            description=data.get("description"),
            supplier=data.get("supplier")
        )
        db.session.add(new_hop)
        db.session.commit()
        return jsonify(new_hop.to_dict()), 201


    @hops_bp.route("/hops/<int:recordUserId>/<int:id>", methods=["PUT"])
    @token_required
    def update_hop(current_user_id, recordUserId, id):

        # Caso o current_user_id seja diferente do recordUserId, cria-se um novo registro
        if recordUserId != current_user_id:
            # Encontrar o equipamento oficial (user_id = 1)
            official_item = Hop.query.filter_by(id=id, user_id=1).first()

            if official_item is None:
                return jsonify({"message": "Official hop not found"}), 404

            # Criar um novo registro para o current_user_id baseado no equipamento oficial
            new_item = Hop(
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
            item = Hop.query.filter_by(id=id, user_id=current_user_id).first()

            if item is None:
                return jsonify({"message": "Hop not found"}), 404

            data = request.json

            item.name = data.get("name", item.name)
            item.description = data.get("description", item.description)
            item.ebc = data.get("ebc", item.ebc)
            item.potential_extract = data.get("potentialExtract", item.potential_extract)
            item.type = data.get("type", item.type)
            item.supplier = data.get("supplier", item.supplier)

            db.session.commit()

            return jsonify(item.to_dict()), 200  # Retornar o registro atualizado



    @hops_bp.route("/hops/<int:recordUserId>/<int:id>", methods=["DELETE"])
    @token_required
    def delete_hop(current_user_id, recordUserId, id):
        if recordUserId != current_user_id:
            return jsonify({"message": "Cannot delete official record"}), 404
        
        hop = Hop.query.filter_by(id=id).first()

        if hop is None:
            return jsonify({"message": "Hop not found"}), 404

        db.session.delete(hop)
        db.session.commit()

        return jsonify({"message": f"Hop with ID {id} was successfully deleted"}), 200

    return hops_bp