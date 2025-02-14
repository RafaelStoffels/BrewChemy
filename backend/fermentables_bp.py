from flask import Blueprint, jsonify, request
from db import db
from AuthTokenVerifier import token_required

class Fermentable(db.Model):
    __tablename__ = 'fermentables'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    ebc = db.Column(db.Numeric(5, 2), nullable=False)
    potential_extract = db.Column(db.Numeric(5, 3), nullable=False)
    malt_type = db.Column(db.String(50), nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False)
    supplier = db.Column(db.String(100), nullable=False)
    unit_price = db.Column(db.Numeric(10, 2))
    notes = db.Column(db.Text)

    # Converte snake_case para camelCase no JSON
    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "name": self.name,
            "description": self.description,
            "ebc": float(self.ebc),
            "potentialExtract": float(self.potential_extract),
            "maltType": self.malt_type,
            "supplier": self.supplier
        }

class FermentableOfficial(db.Model):
    __tablename__ = 'fermentables_official'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    ebc = db.Column(db.Numeric(5, 2), nullable=False)
    potential_extract = db.Column(db.Numeric(5, 3), nullable=False)
    malt_type = db.Column(db.String(50), nullable=False)
    supplier = db.Column(db.String(100), nullable=False)

    # Converte snake_case para camelCase no JSON
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "ebc": float(self.ebc),
            "potentialExtract": float(self.potential_extract),
            "maltType": self.malt_type,
            "supplier": self.supplier
        }

def create_fermentables_bp():
    fermentables_bp = Blueprint("fermentables", __name__)

    @fermentables_bp.route("/fermentables/search", methods=["GET"])
    @token_required
    def search_fermentables(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()

        if not search_term:
            return jsonify({"error": "O parâmetro 'searchTerm' é obrigatório."}), 400

        # Consulta nas duas tabelas usando filtro por nome
        user_fermentables = Fermentable.query.filter(
            Fermentable.user_id == current_user_id,
            Fermentable.name.ilike(f"%{search_term}%")
        ).all()

        official_fermentables = FermentableOfficial.query.filter(
            FermentableOfficial.name.ilike(f"%{search_term}%")
        ).all()

        # Combina os resultados
        combined_fermentables = [fermentable.to_dict() for fermentable in user_fermentables] + \
                                [fermentable.to_dict() for fermentable in official_fermentables]

        return jsonify(combined_fermentables)

    # Return all records (including fermentable_official)
    @fermentables_bp.route("/fermentables", methods=["GET"])
    @token_required
    def get_fermentables(current_user_id):
        # Obtém o parâmetro 'source' da URL
        source = request.args.get("source", "all")  # Padrão é 'all'
    
        print(source);

        if source == "custom":
            # Busca apenas na tabela 'fermentables'
            user_fermentables = Fermentable.query.filter_by(user_id=current_user_id).all()
            return jsonify([fermentable.to_dict() for fermentable in user_fermentables])
    
        elif source == "official":
            # Busca apenas na tabela 'fermentables_official'
            official_fermentables = FermentableOfficial.query.all()
            return jsonify([fermentable.to_dict() for fermentable in official_fermentables])
    
        elif source == "all":
            # Busca nas duas tabelas
            user_fermentables = Fermentable.query.filter_by(user_id=current_user_id).all()
            official_fermentables = FermentableOfficial.query.all()
            combined_fermentables = [fermentable.to_dict() for fermentable in user_fermentables] + \
                                    [fermentable.to_dict() for fermentable in official_fermentables]
            return jsonify(combined_fermentables)
    
        else:
            # Se 'source' não for válido, retorna erro
            return jsonify({"error": "Parâmetro 'source' inválido. Use 'custom', 'official' ou 'all'."}), 400

    # By ID
    @fermentables_bp.route("/fermentables/<int:id>", methods=["GET"])
    @token_required
    def get_fermentable(current_user_id, id):
        # Obtém o parâmetro 'source' da URL
        source = request.args.get("source", "custom")  # Padrão é 'custom'

        if source == "custom":
            # Busca apenas na tabela 'fermentables'
            fermentable = Fermentable.query.filter_by(id=id, user_id=current_user_id).first()
            if fermentable is None:
                return jsonify({"message": "Fermentable not found in custom data"}), 404
            return jsonify(fermentable.to_dict())

        elif source == "official":
            # Busca apenas na tabela 'fermentables_official'
            fermentable = FermentableOfficial.query.filter_by(id=id).first()
            if fermentable is None:
                return jsonify({"message": "Fermentable not found in official data"}), 404
            return jsonify(fermentable.to_dict())

        else:
            # Parâmetro 'source' inválido
            return jsonify({"error": "Invalid 'source' parameter. Use 'custom' or 'official'."}), 400


    # Add record
    @fermentables_bp.route("/fermentables", methods=["POST"])
    @token_required
    def add_fermentable(current_user_id):
        data = request.json

        # Adjustment to handle OPTIONS request errors
        def sanitize(value):
            return value if value != "" else None

        new_fermentable = Fermentable(
            name=data.get("name"),
            description=data.get("description"),
            ebc=sanitize(data.get("ebc")),
            potential_extract=sanitize(data.get("potentialExtract")),
            malt_type=data.get("maltType"),
            supplier=data.get("supplier"),
            user_id=current_user_id
        )
        db.session.add(new_fermentable)
        db.session.commit()
        return jsonify(new_fermentable.to_dict()), 201

    # Update record
    @fermentables_bp.route("/fermentables/<int:id>", methods=["PUT"])
    @token_required
    def update_fermentable(current_user_id, id):
        fermentable = Fermentable.query.filter_by(id=id, user_id=current_user_id).first()
        
        if fermentable is None:
            return jsonify({"message": "Fermentable not found"}), 404

        data = request.json

        fermentable.name = data.get("name", fermentable.name)
        fermentable.description = data.get("description", fermentable.description)
        fermentable.ebc = data.get("ebc", fermentable.ebc)
        fermentable.potential_extract = data.get("potentialExtract", fermentable.potential_extract)
        fermentable.malt_type = data.get("maltType", fermentable.malt_type)
        fermentable.supplier = data.get("supplier", fermentable.supplier)

        db.session.commit()

        return jsonify(fermentable.to_dict()), 200

    # Delete record
    @fermentables_bp.route("/fermentables/<int:id>", methods=["DELETE"])
    @token_required
    def delete_fermentable(current_user_id, id):
        fermentable = Fermentable.query.filter_by(id=id, user_id=current_user_id).first()
        
        if fermentable is None:
            return jsonify({"message": "Fermentable not found"}), 404

        db.session.delete(fermentable)
        db.session.commit()

        return jsonify({"message": f"Fermentable with ID {id} was successfully deleted"}), 200

    return fermentables_bp
