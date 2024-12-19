from flask import Blueprint, jsonify, request
from db import db

# Classe representando os maltes
class Malt(db.Model):
    __tablename__ = 'malts'

    # Definição das colunas da tabela
    id = db.Column(db.Integer, primary_key=True)
    supply_code = db.Column(db.String(50), unique=True, nullable=False)
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
            "supply_code": self.supply_code,
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

# Função para criar o Blueprint
def create_malts_bp():
    malts_bp = Blueprint("malts", __name__)

    # Rota para obter todos os maltes
    @malts_bp.route("/malts", methods=["GET"])
    def get_malts():
        malts = Malt.query.all()  # Busca todos os maltes do banco
        return jsonify([malt.to_dict() for malt in malts])  # Converte para dicionário e retorna


    @malts_bp.route("/malts", methods=["POST"])
    def add_malt():
        data = request.json
        new_malt = Malt(
            supply_code=data.get("supply_code"),
            name=data.get("name"),
            description=data.get("description"),
            color_degrees_lovibond=data.get("color_degrees_lovibond"),
            potential_extract=data.get("potential_extract"),
            malt_type=data.get("malt_type"),
            stock_quantity=data.get("stock_quantity"),
            supplier=data.get("supplier"),
               )
        db.session.add(new_malt)  # Adiciona o novo malte ao banco
        db.session.commit()  # Comita as mudanças no banco
        return jsonify(new_malt.to_dict()), 201  # Retorna o malte recém-adicionado


    @malts_bp.route("/malts/<int:id>", methods=["PUT"])
    def update_malt(id):
        # Busca o malte no banco de dados pelo ID
        malt = Malt.query.get(id)

        # Verifica se o malte existe
        if malt is None:
            return jsonify({"message": "Malte não encontrado"}), 404

        # Obtém os dados da requisição para atualizar
        data = request.json

        # Atualiza os campos do malte com os novos valores, se fornecidos
        malt.supply_code = data.get("supply_code", malt.supply_code)
        malt.name = data.get("name", malt.name)
        malt.description = data.get("description", malt.description)
        malt.color_degrees_lovibond = data.get("color_degrees_lovibond", malt.color_degrees_lovibond)
        malt.potential_extract = data.get("potential_extract", malt.potential_extract)
        malt.malt_type = data.get("malt_type", malt.malt_type)
        malt.stock_quantity = data.get("stock_quantity", malt.stock_quantity)
        malt.supplier = data.get("supplier", malt.supplier)
        malt.unit_price = data.get("unit_price", malt.unit_price)
        malt.notes = data.get("notes", malt.notes)

        # Comita as mudanças no banco de dados
        db.session.commit()

        # Retorna os dados atualizados do malte
        return jsonify(malt.to_dict()), 200

    @malts_bp.route("/malts/<int:id>", methods=["DELETE"])
    def delete_malt(id):
        # Busca o malte no banco de dados pelo ID
        malt = Malt.query.get(id)

        # Verifica se o malte existe
        if malt is None:
            return jsonify({"message": "Malte não encontrado"}), 404

        # Remove o malte do banco de dados
        db.session.delete(malt)
        db.session.commit()

        # Retorna uma mensagem de sucesso
        return jsonify({"message": f"Malte com ID {id} foi deletado com sucesso"}), 200


    return malts_bp