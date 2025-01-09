from flask import Blueprint, jsonify, request
from db import db
from AuthTokenVerifier import token_required

class Malt(db.Model):
    __tablename__ = 'malts'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    color_degrees_lovibond = db.Column(db.Numeric(5, 2), nullable=False)
    potential_extract = db.Column(db.Numeric(5, 3), nullable=False)
    malt_type = db.Column(db.String(50), nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False)
    supplier = db.Column(db.String(100), nullable=False)
    unit_price = db.Column(db.Numeric(10, 2))
    notes = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "color_degrees_lovibond": float(self.color_degrees_lovibond),
            "potential_extract": float(self.potential_extract),
            "malt_type": self.malt_type,
            "stock_quantity": self.stock_quantity,
            "supplier": self.supplier,
            "unit_price": float(self.unit_price) if self.unit_price else None,
            "notes": self.notes,
        }

def create_malts_bp():
    malts_bp = Blueprint("malts", __name__)

    #Return all records
    @malts_bp.route("/malts", methods=["GET"])
    @token_required
    def get_malts(current_user_id):
        malts = Malt.query.filter_by(user_id=current_user_id).all()
        
        return jsonify([malt.to_dict() for malt in malts])

    #Return a specific record
    @malts_bp.route("/malts/<int:id>", methods=["GET"])
    @token_required
    def get_malt(current_user_id, id): 
        malt = Malt.query.filter_by(id=id, user_id=current_user_id).first()
    
        if malt is None:
            return jsonify({"message": "Malt not found"}), 404
    
        return jsonify(malt.to_dict())

    # Add record
    @malts_bp.route("/malts", methods=["POST"])
    @token_required
    def add_malt(current_user_id):
        data = request.json

        # Adjustment to handle OPTIONS request errors
        def sanitize(value):
            return value if value != "" else None

        new_malt = Malt(
            name=data.get("name"),
            description=data.get("description"),
            color_degrees_lovibond=sanitize(data.get("color_degrees_lovibond")),
            potential_extract=sanitize(data.get("potential_extract")),
            malt_type=data.get("malt_type"),
            stock_quantity=sanitize(data.get("stock_quantity")),
            supplier=data.get("supplier"),
            unit_price=sanitize(data.get("unit_price")),
            user_id=current_user_id
        )
        db.session.add(new_malt)
        db.session.commit()
        return jsonify(new_malt.to_dict()), 201

    # Update record
    @malts_bp.route("/malts/<int:id>", methods=["PUT"])
    @token_required
    def update_malt(current_user_id, id):

        malt = Malt.query.filter_by(id=id, user_id=current_user_id).first()
        
        if malt is None:
            return jsonify({"message": "Malt not found"}), 404

        data = request.json

        malt.name = data.get("name", malt.name)
        malt.description = data.get("description", malt.description)
        malt.color_degrees_lovibond = data.get("color_degrees_lovibond", malt.color_degrees_lovibond)
        malt.potential_extract = data.get("potential_extract", malt.potential_extract)
        malt.malt_type = data.get("malt_type", malt.malt_type)
        malt.stock_quantity = data.get("stock_quantity", malt.stock_quantity)
        malt.supplier = data.get("supplier", malt.supplier)
        malt.unit_price = data.get("unit_price", malt.unit_price)
        malt.notes = data.get("notes", malt.notes)

        db.session.commit()

        return jsonify(malt.to_dict()), 200

    # Delete record
    @malts_bp.route("/malts/<int:id>", methods=["DELETE"])
    @token_required
    def delete_malt(current_user_id, id):

        malt = Malt.query.filter_by(id=id, user_id=current_user_id).first()
        
        if malt is None:
            return jsonify({"message": "Malt not found"}), 404

        db.session.delete(malt)
        db.session.commit()

        return jsonify({"message": f"Malte com ID {id} foi deletado com sucesso"}), 200

    return malts_bp