from flask import Blueprint, jsonify, request
from db import db
from models import Yeast
from AuthTokenVerifier import token_required


def create_yeasts_bp():
    yeasts_bp = Blueprint("yeasts", __name__)

    @yeasts_bp.route("/yeasts/search", methods=["GET"])
    @token_required
    def search_yeasts(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()
        
        if not search_term:
            return jsonify({"error": "Search term is required"}), 400
        
        # Subquery para encontrar fermentáveis do usuário atual
        subquery = db.session.query(Yeast.official_id).filter(
            Yeast.user_id == current_user_id,
            Yeast.official_id.isnot(None)  # Evita incluir valores NULL
        ).distinct()
        
        subquery_list = [id for (id,) in subquery.all()]
        print("Subquery list (sem NULL):", subquery_list)
        
        # Busca fermentáveis que correspondam ao termo de pesquisa
        items = Yeast.query.filter(
            (
                (Yeast.user_id == current_user_id) |  # Pega fermentáveis do usuário
                (
                    (Yeast.user_id == 1) &  # Apenas fermentáveis oficiais
                    (~Yeast.id.in_(subquery_list))  # Exclui os personalizados
                )
            ) &
            (Yeast.name.ilike(f"%{search_term}%"))  # Filtra pelo nome
        ).limit(12).all()
        
        return jsonify([item.to_dict() for item in items])

    # Return all yeasts
    @yeasts_bp.route("/yeasts", methods=["GET"])
    @token_required
    def get_yeasts(current_user_id):
        # filtra todos os registro com official id do usuario corrente
        subquery = db.session.query(Yeast.official_id).filter(
            Yeast.user_id == current_user_id,
            Yeast.official_id.isnot(None)  # Evita incluir valores NULL
        ).distinct()
        
        # Exibir os resultados da subquery para debug
        subquery_list = [id for (id,) in subquery.all()]
        print("Subquery list (sem NULL):", subquery_list)
        
        # Buscar os fermentáveis considerando a lógica correta
        items = Yeast.query.filter(
            (Yeast.user_id == current_user_id) |  # Pega os fermentáveis do usuário atual
            (
                (Yeast.user_id == 1) &  # Apenas fermentáveis oficiais
                (~Yeast.id.in_(subquery_list))  # Exclui aqueles que já foram personalizados
            )
        ).limit(12).all()
        
        # Retorna os dados formatados como JSON
        return jsonify([item.to_dict() for item in items])

    # Return a specific yeast
    @yeasts_bp.route("/yeasts/<int:recordUserId>/<int:id>", methods=["GET"])
    def get_yeast(recordUserId, id):
        item = Yeast.query.filter_by(id=id, user_id=recordUserId).first()
        
        if item is None:
            return jsonify({"message": "yeast not found"}), 404

        return jsonify(item.to_dict())

    # Add a new yeast
    @yeasts_bp.route("/yeasts", methods=["POST"])
    @token_required
    def add_yeast(current_user_id):
        data = request.json

        # Adjustment to handle empty values
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

    # Update a yeast
    @yeasts_bp.route("/yeasts/<int:recordUserId>/<int:id>", methods=["PUT"])
    @token_required
    def update_yeast(current_user_id, recordUserId, id):
        # Caso o current_user_id seja diferente do recordUserId, cria-se um novo registro
        if recordUserId != current_user_id:
            # Encontrar a levedura oficial (user_id = 1)
            official_item = Yeast.query.filter_by(id=id, user_id=1).first()

            if official_item is None:
                return jsonify({"message": "Official yeast not found"}), 404

            # Criar um novo registro para o current_user_id baseado na levedura oficial
            new_item = Yeast(
                user_id=current_user_id,
                official_id=id,  # Associar ao ID oficial
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

            # Atualizar os dados do novo item com os valores fornecidos, se existirem
            data = request.json
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

            # Adicionar o novo item e confirmar a transação
            db.session.add(new_item)
            db.session.commit()

            return jsonify(new_item.to_dict()), 201  # Retornar o novo registro criado

        else:
            # Caso current_user_id e recordUserId sejam iguais, apenas atualiza o registro
            item = Yeast.query.filter_by(id=id, user_id=current_user_id).first()

            if item is None:
                return jsonify({"message": "Yeast not found"}), 404

            data = request.json

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

            return jsonify(item.to_dict()), 200  # Retornar o registro atualizado

    # Delete a yeast
    @yeasts_bp.route("/yeasts/<int:recordUserId>/<int:id>", methods=["DELETE"])
    @token_required
    def delete_yeast(current_user_id, recordUserId, id):
        if recordUserId != current_user_id:
            return jsonify({"message": "Cannot delete official record"}), 404

        yeast = Yeast.query.filter_by(id=id).first()

        if yeast is None:
            return jsonify({"message": "Yeast not found"}), 404

        db.session.delete(yeast)
        db.session.commit()

        return jsonify({"message": f"Yeast with ID {id} was successfully deleted"}), 200

    return yeasts_bp