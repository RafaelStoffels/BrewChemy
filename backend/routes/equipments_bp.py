from flask import Blueprint, jsonify, request
from db import db
from models import Equipment
from AuthTokenVerifier import token_required
from marshmallow import ValidationError
from schemas.equipments_schema import EquipmentsSchema

def create_equipments_bp():
    equipments_bp = Blueprint("equipments", __name__)

    @equipments_bp.route("/equipments/search", methods=["GET"])
    @token_required
    def search_equipments(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()

        if not search_term:
            return jsonify({"error": "Search term is required"}), 400

        # Subquery to find fermentables of the current user
        subquery = db.session.query(Equipment.official_id).filter(
            Equipment.user_id == current_user_id,
            Equipment.official_id.isnot(None)  # Avoids including NULL values
        ).distinct()

        subquery_list = [id for (id,) in subquery.all()]

        items = Equipment.query.filter(
            (
                (Equipment.user_id == current_user_id) |
                (
                    (Equipment.user_id == 1) &
                    (~Equipment.id.in_(subquery_list))
                )
            ) &
            (Equipment.name.ilike(f"%{search_term}%"))
        ).limit(12).all()

        return jsonify([item.to_dict() for item in items])

    @equipments_bp.route("/equipments", methods=["GET"])
    @token_required
    def get_equipments(current_user_id):
        # Filters all records with the current user's official ID
        subquery = db.session.query(Equipment.official_id).filter(
            Equipment.user_id == current_user_id,
            Equipment.official_id.isnot(None)
        ).distinct()

        subquery_list = [id for (id,) in subquery.all()]

        items = Equipment.query.filter(
            (Equipment.user_id == current_user_id) |
            (
                (Equipment.user_id == 1) &
                (~Equipment.id.in_(subquery_list))  # Excludes customized
            )
        ).limit(12).all()

        return jsonify([item.to_dict() for item in items])

    @equipments_bp.route("/equipments/<int:itemUserId>/<int:id>", methods=["GET"])
    def get_equipment(itemUserId, id):
        item = Equipment.query.filter_by(id=id, user_id=itemUserId).first()

        if item is None:
            return jsonify({"message": "equipment not found"}), 404

        return jsonify(item.to_dict())

    @equipments_bp.route("/equipments", methods=["POST"])
    @token_required
    def add_equipment(current_user_id):
        schema = EquipmentsSchema()

        try:
            data = schema.load(request.json)
        except ValidationError as err:
            return jsonify({"errors": err.messages}), 400

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

    @equipments_bp.route("/equipments/<int:id>", methods=["PUT"])
    @token_required
    def update_equipment(current_user_id, id):
        schema = EquipmentsSchema()

        try:
            data = schema.load(request.json)
        except ValidationError as err:
            print("err.messages ", err.messages)
            return jsonify({"errors": err.messages}), 400

        itemUserId = data.get("itemUserId")

        if itemUserId != current_user_id:
            # Find the official equipment (user_id = 1)
            official_item = Equipment.query.filter_by(id=id, user_id=1).first()

            if official_item is None:
                return jsonify({"message": "Official equipment not found"}), 404

            new_item = Equipment(
                user_id=current_user_id,
                official_id=id,
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

            # Update the new equipment's data with the provided values, if they exist
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

            db.session.add(new_item)
            db.session.commit()

            return jsonify(new_item.to_dict()), 201

        else:
            item = Equipment.query.filter_by(id=id, user_id=current_user_id).first()

            if item is None:
                return jsonify({"message": "Equipment not found"}), 404

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

            return jsonify(item.to_dict()), 200

    @equipments_bp.route("/equipments/<int:itemUserId>/<int:id>", methods=["DELETE"])
    @token_required
    def delete_equipment(current_user_id, itemUserId, id):
        if itemUserId != current_user_id:
            return jsonify({"message": "Cannot delete official record"}), 404

        equipment = Equipment.query.filter_by(id=id, user_id=current_user_id).first()
        if equipment is None:
            return jsonify({"message": "Equipment not found"}), 404

        db.session.delete(equipment)
        db.session.commit()
        return jsonify({"message": f"Equipment with ID {id} was successfully deleted"}), 200

    return equipments_bp
