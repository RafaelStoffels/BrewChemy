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
            return jsonify({"error": "O parâmetro 'searchTerm' é obrigatório."}), 400

        user_equipments = Equipment.query.filter(
            (Equipment.user_id == current_user_id) | (Equipment.user_id == 1),
            Equipment.name.ilike(f"%{search_term}%")
        ).all()

        return jsonify([equipment.to_dict() for equipment in user_equipments])

    # Return all records
    @equipments_bp.route("/equipments", methods=["GET"])
    @token_required
    def get_equipments(current_user_id):
        all_equipments = Equipment.query.filter(
            (Equipment.user_id == current_user_id) | (Equipment.user_id == 1)
        ).all()
        return jsonify([equipment.to_dict() for equipment in all_equipments])
    
    # By ID
    @equipments_bp.route("/equipments/<int:id>", methods=["GET"])
    @token_required
    def get_equipment(current_user_id, id):

        equipment = Equipment.query.filter_by(id=id, user_id=current_user_id).first()
        if equipment is None:
            return jsonify({"message": "equipment not found in custom data"}), 404

        # Usando logging para mostrar os dados
        print(f"BatchTime do equipamento: {equipment.batch_time}")

        # Se quiser ver todos os dados do equipamento:
        print(f"Equipamento encontrado: {equipment.to_dict()}")

        return jsonify(equipment.to_dict())

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
    @equipments_bp.route("/equipments/<int:id>", methods=["PUT"])
    @token_required
    def update_equipment(current_user_id, id):
        equipment = Equipment.query.filter_by(id=id, user_id=current_user_id).first()
        if equipment is None:
            return jsonify({"message": "Equipment not found"}), 404

        data = request.json

        print(request.json);

        equipment.name = data.get("name", equipment.name)
        equipment.description = data.get("description", equipment.description)
        equipment.efficiency = data.get("efficiency", equipment.efficiency)
        equipment.batch_volume = data.get("batchVolume", equipment.batch_volume)
        equipment.batch_time = data.get("batchTime", equipment.batch_time)
        equipment.boil_time = data.get("boilTime", equipment.boil_time)
        equipment.boil_temperature = data.get("boilTemperature", equipment.boil_temperature)
        equipment.boil_off = data.get("boilOff", equipment.boil_off)
        equipment.trub_loss = data.get("trubLoss", equipment.trub_loss)
        equipment.dead_space = data.get("deadSpace", equipment.dead_space)

        db.session.commit()
        return jsonify(equipment.to_dict()), 200

    # Delete record
    @equipments_bp.route("/equipments/<int:id>", methods=["DELETE"])
    @token_required
    def delete_equipment(current_user_id, id):
        equipment = Equipment.query.filter_by(id=id, user_id=current_user_id).first()
        if equipment is None:
            return jsonify({"message": "Equipment not found"}), 404

        db.session.delete(equipment)
        db.session.commit()
        return jsonify({"message": f"Equipment with ID {id} was successfully deleted"}), 200

    return equipments_bp
