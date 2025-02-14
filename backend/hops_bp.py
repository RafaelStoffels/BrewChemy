from flask import Blueprint, jsonify, request
from db import db
from AuthTokenVerifier import token_required

class Hop(db.Model):
    __tablename__ = 'hops'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    alpha_acid_content = db.Column(db.Numeric(5, 2))
    beta_acid_content = db.Column(db.Numeric(5, 2))
    type = db.Column(db.String(50))
    country_of_origin = db.Column(db.String(50))
    description = db.Column(db.Text)

    # Convert snake_case to camelCase in JSON
    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "name": self.name,
            "alphaAcidContent": float(self.alpha_acid_content) if self.alpha_acid_content else None,
            "betaAcidContent": float(self.beta_acid_content) if self.beta_acid_content else None,
            "type": self.type,
            "countryOfOrigin": self.country_of_origin,
            "description": self.description,
        }

class HopOfficial(db.Model):
    __tablename__ = 'hops_official'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    alpha_acid_content = db.Column(db.Numeric(5, 2))
    beta_acid_content = db.Column(db.Numeric(5, 2))
    type = db.Column(db.String(50))
    country_of_origin = db.Column(db.String(50))
    description = db.Column(db.Text)

    # Converte snake_case para camelCase no JSON
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "alphaAcidContent": float(self.alpha_acid_content) if self.alpha_acid_content else None,
            "betaAcidContent": float(self.beta_acid_content) if self.beta_acid_content else None,
            "type": self.type,
            "countryOfOrigin": self.country_of_origin,
            "description": self.description,
        }

def create_hops_bp():
    hops_bp = Blueprint("hops", __name__)

    @hops_bp.route("/hops/search", methods=["GET"])
    @token_required
    def search_hops(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()

        if not search_term:
            return jsonify({"error": "O parâmetro 'searchTerm' é obrigatório."}), 400

        # Consulta nas duas tabelas usando filtro por nome
        user_hops = Hop.query.filter(
            Hop.user_id == current_user_id,
            Hop.name.ilike(f"%{search_term}%")
        ).all()

        official_hops = HopOfficial.query.filter(
            HopOfficial.name.ilike(f"%{search_term}%")
        ).all()

        # Combina os resultados
        combined_hops = [hop.to_dict() for hop in user_hops] + \
                                [hop.to_dict() for hop in official_hops]

        return jsonify(combined_hops)

    # Return all hops
    @hops_bp.route("/hops", methods=["GET"])
    @token_required
    def get_hops(current_user_id):
     #   user_hops = Hop.query.filter_by(user_id=current_user_id).all()
     #   official_hops = HopOfficial.query.all()

     #   combined_hops = [Hop.to_dict() for Hop in user_hops] + \
     #                           [Hop.to_dict() for Hop in official_hops]

     #   return jsonify(official_hops)

        official_hops = HopOfficial.query.all()

        return jsonify([hop.to_dict() for hop in official_hops])

    # Return a specific hop
    @hops_bp.route("/hops/<int:id>", methods=["GET"])
    @token_required
    def get_hop(current_user_id, id):
        hop = Hop.query.filter_by(id=id).first()

        if hop is None:
            return jsonify({"message": "Hop not found"}), 404

        return jsonify(hop.to_dict())

    # Add a new hop
    @hops_bp.route("/hops", methods=["POST"])
    @token_required
    def add_hop(current_user_id):
        data = request.json

        # Adjustment to handle OPTIONS request errors
        def sanitize(value):
            return value if value != "" else None

        new_hop = Hop(
            name=data.get("name"),
            alpha_acid_content=sanitize(data.get("alphaAcidContent")),
            beta_acid_content=sanitize(data.get("betaAcidContent")),
            type=data.get("type"),
            country_of_origin=data.get("countryOfOrigin"),
            description=data.get("description")
        )
        db.session.add(new_hop)
        db.session.commit()
        return jsonify(new_hop.to_dict()), 201

    # Update a hop
    @hops_bp.route("/hops/<int:id>", methods=["PUT"])
    @token_required
    def update_hop(current_user_id, id):
        hop = Hop.query.filter_by(id=id).first()

        if hop is None:
            return jsonify({"message": "Hop not found"}), 404

        data = request.json

        hop.name = data.get("name", hop.name)
        hop.alpha_acid_content = data.get("alphaAcidContent", hop.alpha_acid_content)
        hop.beta_acid_content = data.get("betaAcidContent", hop.beta_acid_content)
        hop.type = data.get("type", hop.type)
        hop.country_of_origin = data.get("countryOfOrigin", hop.country_of_origin)
        hop.description = data.get("description", hop.description)

        db.session.commit()

        return jsonify(hop.to_dict()), 200

    # Delete a hop
    @hops_bp.route("/hops/<int:id>", methods=["DELETE"])
    @token_required
    def delete_hop(current_user_id, id):
        hop = Hop.query.filter_by(id=id).first()

        if hop is None:
            return jsonify({"message": "Hop not found"}), 404

        db.session.delete(hop)
        db.session.commit()

        return jsonify({"message": f"Hop with ID {id} was successfully deleted"}), 200

    return hops_bp