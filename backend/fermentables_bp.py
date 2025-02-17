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
    official_fermentable_id = db.Column(db.Integer, nullable=False)

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
            "supplier": self.supplier,
            "officialFermentableId": self.official_fermentable_id
        }


def create_fermentables_bp():
    fermentables_bp = Blueprint("fermentables", __name__)

    @fermentables_bp.route("/fermentables/search", methods=["GET"])
    @token_required
    def search_fermentables(current_user_id):
        search_term = request.args.get("searchTerm", "").strip()

        if not search_term:
            return jsonify({"error": "O parâmetro 'searchTerm' é obrigatório."}), 400

        # Busca apenas na tabela `fermentables`, excluindo registros vinculados a `fermentable_official`
        user_fermentables = Fermentable.query.filter(
            Fermentable.user_id == current_user_id,
            Fermentable.name.ilike(f"%{search_term}%"),
            Fermentable.official_fermentable_id.is_(None)  # Ignora os registros vinculados
        ).all()

        # Retorna apenas os resultados da tabela `fermentables`
        return jsonify([fermentable.to_dict() for fermentable in user_fermentables])


    @fermentables_bp.route("/fermentables", methods=["GET"])
    @token_required
    def get_fermentables(current_user_id):
        # Obtém o parâmetro 'source' da URL
        source = request.args.get("source", "all")  # Padrão é 'all'
        
        print(source)

        if source == "custom":
            # Busca apenas fermentáveis personalizados do usuário
            user_fermentables = Fermentable.query.filter(
                Fermentable.user_id == current_user_id
            ).all()
            return jsonify([fermentable.to_dict() for fermentable in user_fermentables])

        elif source == "official":
            # Busca apenas fermentáveis oficiais (user_id = 0)
            official_fermentables = Fermentable.query.filter(
                Fermentable.user_id == 1
            ).all()
            return jsonify([fermentable.to_dict() for fermentable in official_fermentables])

        elif source == "all":
            # Busca todos os fermentáveis (do usuário e oficiais)
            all_fermentables = Fermentable.query.filter(
                (Fermentable.user_id == current_user_id) | (Fermentable.user_id == 1)
            ).all()
            return jsonify([fermentable.to_dict() for fermentable in all_fermentables])

        else:
            # Se 'source' não for válido, retorna erro
            return jsonify({"error": "Parâmetro 'source' inválido. Use 'custom', 'official' ou 'all'."}), 400


    @fermentables_bp.route("/fermentables/<int:id>", methods=["GET"])
    @token_required
    def get_fermentable(current_user_id, id):
        # Obtém o parâmetro 'source' da URL
        source = request.args.get("source", "custom")  # Padrão é 'custom'

        if source == "custom":
            # Busca apenas fermentáveis do usuário
            fermentable = Fermentable.query.filter_by(id=id, user_id=current_user_id).first()
            if fermentable is None:
                return jsonify({"message": "Fermentable not found in custom data"}), 404
            return jsonify(fermentable.to_dict())

        elif source == "official":
            # Busca apenas fermentáveis oficiais (user_id = 0)
            fermentable = Fermentable.query.filter_by(id=id, user_id=0).first()
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
            user_id=current_user_id,
            official_fermentable_id=data.get("officialFermentableId")
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
