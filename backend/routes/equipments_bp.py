from flask import Blueprint, jsonify, request
from db import db
from models import Equipment
from AuthTokenVerifier import token_required
from datetime import datetime


def create_equipments_bp():
    equipments_bp = Blueprint("equipments", __name__)

    @equipments_bp.route("/equipments/search", methods=["GET"])
    @token_required
    def search_equipments(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()
        
        if not search_term:
            return jsonify({"error": "Search term is required"}), 400
        
        # Subquery para encontrar fermentáveis do usuário atual
        subquery = db.session.query(Equipment.official_id).filter(
            Equipment.user_id == current_user_id,
            Equipment.official_id.isnot(None)  # Evita incluir valores NULL
        ).distinct()
        
        subquery_list = [id for (id,) in subquery.all()]
        print("Subquery list (sem NULL):", subquery_list)
        
        # Busca fermentáveis que correspondam ao termo de pesquisa
        items = Equipment.query.filter(
            (
                (Equipment.user_id == current_user_id) |  # Pega fermentáveis do usuário
                (
                    (Equipment.user_id == 1) &  # Apenas fermentáveis oficiais
                    (~Equipment.id.in_(subquery_list))  # Exclui os personalizados
                )
            ) &
            (Equipment.name.ilike(f"%{search_term}%"))  # Filtra pelo nome
        ).limit(12).all()
        
        return jsonify([item.to_dict() for item in items])


    @equipments_bp.route("/equipments", methods=["GET"])
    @token_required
    def get_equipments(current_user_id):
        # filtra todos os registro com official id do usuario corrente
        subquery = db.session.query(Equipment.official_id).filter(
            Equipment.user_id == current_user_id,
            Equipment.official_id.isnot(None)  # Evita incluir valores NULL
        ).distinct()
        
        # Exibir os resultados da subquery para debug
        subquery_list = [id for (id,) in subquery.all()]
        print("Subquery list (sem NULL):", subquery_list)
        
        # Buscar os fermentáveis considerando a lógica correta
        items = Equipment.query.filter(
            (Equipment.user_id == current_user_id) |  # Pega os fermentáveis do usuário atual
            (
                (Equipment.user_id == 1) &  # Apenas fermentáveis oficiais
                (~Equipment.id.in_(subquery_list))  # Exclui aqueles que já foram personalizados
            )
        ).limit(12).all()
        
        # Retorna os dados formatados como JSON
        return jsonify([item.to_dict() for item in items])

    
    # By ID
    @equipments_bp.route("/equipments/<int:recordUserId>/<int:id>", methods=["GET"])
    def get_equipment(recordUserId, id):
        item = Equipment.query.filter_by(id=id, user_id=recordUserId).first()
        
        if item is None:
            return jsonify({"message": "equipment not found"}), 404

        return jsonify(item.to_dict())

    # Add record
    @equipments_bp.route("/equipments", methods=["POST"])
    @token_required
    def add_equipment(current_user_id):

        data = request.json

        print(data.get("boilOff"));

        new_equipment = Equipment(
            user_id=current_user_id,
            name=data.get("name"),
            description=data.get("description"),
            efficiency=data.get("efficiency"),
            batch_volume=data.get("batchVolume"),
            batch_time=data.get("batchTime"),
            boil_time=data.get("boilTime"),
            boil_temperature=data.get("boilTemperature"),
            boil_off=data.get("boilOff"),
            trub_loss=data.get("trubLoss"),
            dead_space=data.get("deadSpace")
        )
        db.session.add(new_equipment)
        db.session.commit()
        return jsonify(new_equipment.to_dict()), 201

    # Update record
    @equipments_bp.route("/equipments/<int:recordUserId>/<int:id>", methods=["PUT"])
    @token_required
    def update_equipment(current_user_id, recordUserId, id):

        # Caso o current_user_id seja diferente do recordUserId, cria-se um novo registro
        if recordUserId != current_user_id:
            # Encontrar o equipamento oficial (user_id = 1)
            official_item = Equipment.query.filter_by(id=id, user_id=1).first()

            if official_item is None:
                return jsonify({"message": "Official equipment not found"}), 404

            # Criar um novo registro para o current_user_id baseado no equipamento oficial
            new_item = Equipment(
                user_id=current_user_id,
                official_id=id,  # Associar ao ID oficial
                name=official_item.name,
                description=official_item.description,
                efficiency=official_item.efficiency,
                batch_volume=official_item.batch_volume,
                batch_time=official_item.batch_time,
                boil_time=official_item.boil_time,
                boil_temperature=official_item.boil_temperature,
                boil_off=official_item.boil_off,
                trub_loss=official_item.trub_loss,
                dead_space=official_item.dead_space
            )

            # Atualizar os dados do novo equipamento com os valores fornecidos, se existirem
            data = request.json
            new_item.name = data.get("name", new_item.name)
            new_item.description = data.get("description", new_item.description)
            new_item.efficiency = data.get("efficiency", new_item.efficiency)
            new_item.batch_volume = data.get("batchVolume", new_item.batch_volume)
            new_item.batch_time = data.get("batchTime", new_item.batch_time)
            new_item.boil_time = data.get("boilTime", new_item.boil_time)
            new_item.boil_temperature = data.get("boilTemperature", new_item.boil_temperature)
            new_item.boil_off = data.get("boilOff", new_item.boil_off)
            new_item.trub_loss = data.get("trubLoss", new_item.trub_loss)
            new_item.dead_space = data.get("deadSpace", new_item.dead_space)

            # Adicionar o novo equipamento e confirmar a transação
            db.session.add(new_item)
            db.session.commit()

            return jsonify(new_item.to_dict()), 201  # Retornar o novo registro criado

        else:
            # Caso current_user_id e recordUserId sejam iguais, apenas atualiza o registro
            item = Equipment.query.filter_by(id=id, user_id=current_user_id).first()

            if item is None:
                return jsonify({"message": "Equipment not found"}), 404

            data = request.json

            item.name = data.get("name", item.name)
            item.description = data.get("description", item.description)
            item.efficiency = data.get("efficiency", item.efficiency)
            item.batch_volume = data.get("batchVolume", item.batch_volume)
            item.batch_time = data.get("batchTime", item.batch_time)
            item.boil_time = data.get("boilTime", item.boil_time)
            item.boil_temperature = data.get("boilTemperature", item.boil_temperature)
            item.boil_off = data.get("boilOff", item.boil_off)
            item.trub_loss = data.get("trubLoss", item.trub_loss)
            item.dead_space = data.get("deadSpace", item.dead_space)

            db.session.commit()

            return jsonify(item.to_dict()), 200  # Retornar o registro atualizado


    # Delete record
    @equipments_bp.route("/equipments/<int:recordUserId>/<int:id>", methods=["DELETE"])
    @token_required
    def delete_equipment(current_user_id, recordUserId, id):
        if recordUserId != current_user_id:
            return jsonify({"message": "Cannot delete official record"}), 404

        equipment = Equipment.query.filter_by(id=id, user_id=current_user_id).first()
        if equipment is None:
            return jsonify({"message": "Equipment not found"}), 404

        db.session.delete(equipment)
        db.session.commit()
        return jsonify({"message": f"Equipment with ID {id} was successfully deleted"}), 200

    return equipments_bp
