from flask import Blueprint, jsonify, request
from db import db
from AuthTokenVerifier import token_required
from datetime import datetime

class Equipment(db.Model):
    __tablename__ = 'equipments'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    efficiency = db.Column(db.Numeric(5, 2), nullable=False)
    batch_volume = db.Column(db.Numeric(10, 2), nullable=False)
    boil_time = db.Column(db.Integer, nullable=False)
    boil_temperature = db.Column(db.Numeric(5, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Convert snake_case to camelCase in JSON
    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "name": self.name,
            "description": self.description,
            "efficiency": float(self.efficiency),
            "batchVolume": float(self.batch_volume),
            "boilTime": self.boil_time,
            "boilTemperature": float(self.boil_temperature),
            "createdAt": self.created_at.isoformat()
        }
    
class EquipmentOfficial(db.Model):
    __tablename__ = 'equipments_official'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    efficiency = db.Column(db.Numeric(5, 2), nullable=False)
    batch_volume = db.Column(db.Numeric(10, 2), nullable=False)
    boil_time = db.Column(db.Integer, nullable=False)
    boil_temperature = db.Column(db.Numeric(5, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Convert snake_case to camelCase in JSON
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "efficiency": float(self.efficiency),
            "batchVolume": float(self.batch_volume),
            "boilTime": self.boil_time,
            "boilTemperature": float(self.boil_temperature),
            "createdAt": self.created_at.isoformat()
        }

def create_equipments_bp():
    equipments_bp = Blueprint("equipments", __name__)

    # Return all records
    @equipments_bp.route("/equipments", methods=["GET"])
    @token_required
    def get_equipments(current_user_id):
        # Obtém o parâmetro 'source' da URL
        source = request.args.get("source", "all")  # Padrão é 'all'
    
        print(source);

        if source == "custom":
            # Busca apenas na tabela 'equipments'
            user_equipments = Equipment.query.filter_by(user_id=current_user_id).all()
            return jsonify([equipment.to_dict() for equipment in user_equipments])
    
        elif source == "official":
            # Busca apenas na tabela 'equipment_official'
            official_equipments = EquipmentOfficial.query.all()
            return jsonify([equipment.to_dict() for equipment in official_equipments])
    
        elif source == "all":
            # Busca nas duas tabelas
            user_equipments = Equipment.query.filter_by(user_id=current_user_id).all()
            official_equipments = EquipmentOfficial.query.all()
            combined_equipments = [equipment.to_dict() for equipment in user_equipments] + \
                                  [equipment.to_dict() for equipment in official_equipments]
            return jsonify(combined_equipments)
    
        else:
            # Se 'source' não for válido, retorna erro
            return jsonify({"error": "Parâmetro 'source' inválido. Use 'custom', 'official' ou 'all'."}), 400

    # By ID
    @equipments_bp.route("/equipments/<int:id>", methods=["GET"])
    @token_required
    def get_equipment(current_user_id, id):
        # Obtém o parâmetro 'source' da URL
        source = request.args.get("source", "custom")  # Padrão é 'custom'

        if source == "custom":
            # Busca apenas na tabela 'equipments'
            equipment = Equipment.query.filter_by(id=id, user_id=current_user_id).first()
            if equipment is None:
                return jsonify({"message": "equipment not found in custom data"}), 404
            return jsonify(equipment.to_dict())

        elif source == "official":
            # Busca apenas na tabela 'equipments'
            equipment = EquipmentOfficial.query.filter_by(id=id).first()
            if equipment is None:
                return jsonify({"message": "Equipment not found in official data"}), 404
            return jsonify(equipment.to_dict())

        else:
            # Parâmetro 'source' inválido
            return jsonify({"error": "Invalid 'source' parameter. Use 'custom' or 'official'."}), 400


        equipment = Equipment.query.filter_by(id=id, user_id=current_user_id).first()
        if equipment is None:
            return jsonify({"message": "Equipment not found"}), 404
        return jsonify(equipment.to_dict())

    # Add record
    @equipments_bp.route("/equipments", methods=["POST"])
    @token_required
    def add_equipment(current_user_id):
        data = request.json
        new_equipment = Equipment(
            user_id=current_user_id,
            name=data.get("name"),
            description=data.get("description"),
            efficiency=data.get("efficiency"),
            batch_volume=data.get("batchVolume"),
            boil_time=data.get("boilTime"),
            boil_temperature=data.get("boilTemperature")
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
        equipment.name = data.get("name", equipment.name)
        equipment.description = data.get("description", equipment.description)
        equipment.efficiency = data.get("efficiency", equipment.efficiency)
        equipment.batch_volume = data.get("batchVolume", equipment.batch_volume)
        equipment.boil_time = data.get("boilTime", equipment.boil_time)
        equipment.boil_temperature = data.get("boilTemperature", equipment.boil_temperature)

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
