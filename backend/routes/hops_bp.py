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
            return jsonify({"error": "Search term is required"}), 400
        
        # Subquery para encontrar fermentáveis do usuário atual
        subquery = db.session.query(Hop.official_id).filter(
            Hop.user_id == current_user_id,
            Hop.official_id.isnot(None)  # Evita incluir valores NULL
        ).distinct()
        
        subquery_list = [id for (id,) in subquery.all()]
        print("Subquery list (sem NULL):", subquery_list)
        
        # Busca fermentáveis que correspondam ao termo de pesquisa
        items = Hop.query.filter(
            (
                (Hop.user_id == current_user_id) |  # Pega fermentáveis do usuário
                (
                    (Hop.user_id == 1) &  # Apenas fermentáveis oficiais
                    (~Hop.id.in_(subquery_list))  # Exclui os personalizados
                )
            ) &
            (Hop.name.ilike(f"%{search_term}%"))  # Filtra pelo nome
        ).limit(12).all()
        
        return jsonify([item.to_dict() for item in items])


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
        data = request.json

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
                name=data.get("name", official_item.name),
                alpha_acid_content=data.get("alphaAcidContent", official_item.alpha_acid_content),
                beta_acid_content=data.get("betaAcidContent", official_item.beta_acid_content),
                type=data.get("type", official_item.type),
                use_type=data.get("useType", official_item.use_type),
                country_of_origin=data.get("countryOfOrigin", official_item.country_of_origin),
                description=data.get("description", official_item.description),
                supplier=data.get("supplier", official_item.supplier)
            )

            # Adicionar o novo equipamento e confirmar a transação
            db.session.add(new_item)
            db.session.commit()

            return jsonify(new_item.to_dict()), 201  # Retornar o novo registro criado

        else:
            # Caso current_user_id e recordUserId sejam iguais, apenas atualiza o registro
            item = Hop.query.filter_by(id=id, user_id=current_user_id).first()

            if item is None:
                return jsonify({"message": "Hop not found"}), 404

            item.name = data.get("name", item.name)
            item.alpha_acid_content = data.get("alphaAcidContent", item.alpha_acid_content)
            item.beta_acid_content = data.get("betaAcidContent", item.beta_acid_content)
            item.type = data.get("type", item.type)
            item.use_type = data.get("useType", item.use_type)
            item.country_of_origin = data.get("countryOfOrigin", item.country_of_origin)
            item.description = data.get("description", item.description)
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