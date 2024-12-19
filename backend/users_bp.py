from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
from db import db

SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')  # Chave secreta da variável de ambiente

# Classe representando os usuários
class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())
    last_login = db.Column(db.TIMESTAMP, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    brewery = db.Column(db.String(150), nullable=True)

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at,
            "last_login": self.last_login,
            "is_active": self.is_active,
            "brewery": self.brewery,
        }

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)


# Função para criar o Blueprint de usuários e autenticação
def create_users_bp():
    users_bp = Blueprint("users", __name__)

    # Rota para obter todos os usuários
    @users_bp.route("/users", methods=["GET"])
    def get_users():
        users = User.query.all()  # Busca todos os usuários do banco
        return jsonify([user.to_dict() for user in users])  # Converte para dicionário e retorna

    # Rota para obter um único usuário pelo ID
    @users_bp.route("/users/<int:user_id>", methods=["GET"])
    def get_user(user_id):
        user = User.query.get(user_id)  # Busca o usuário pelo ID

        if user is None:
            return jsonify({"message": "Usuário não encontrado"}), 404  # Se não encontrar, retorna erro 404

        return jsonify(user.to_dict())  # Retorna os dados do usuário encontrado

    # Rota para adicionar um novo usuário
    @users_bp.route("/users", methods=["POST"])
    def add_user():
        data = request.json
        new_user = User(
            name=data.get("name"),
            email=data.get("email"),
            password_hash=data.get("password_hash"),
            brewery=data.get("brewery"),
        )
        db.session.add(new_user)  # Adiciona o novo usuário ao banco
        db.session.commit()  # Comita as mudanças no banco
        return jsonify(new_user.to_dict()), 201  # Retorna o usuário recém-adicionado

    # Rota para atualizar um usuário
    @users_bp.route("/users/<int:user_id>", methods=["PUT"])
    def update_user(user_id):
        user = User.query.get(user_id)

        if user is None:
            return jsonify({"message": "Usuário não encontrado"}), 404

        data = request.json

        user.name = data.get("name", user.name)
        user.email = data.get("email", user.email)
        user.password_hash = data.get("password_hash", user.password_hash)
        user.brewery = data.get("brewery", user.brewery)
        user.is_active = data.get("is_active", user.is_active)

        db.session.commit()
        return jsonify(user.to_dict()), 200

    # Rota para deletar um usuário
    @users_bp.route("/users/<int:user_id>", methods=["DELETE"])
    def delete_user(user_id):
        user = User.query.get(user_id)

        if user is None:
            return jsonify({"message": "Usuário não encontrado"}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": f"Usuário com ID {user_id} foi deletado com sucesso"}), 200

    # Função para login
    @users_bp.route("/login", methods=["POST"])
    def login():
        data = request.json
        email = data.get('email')
        password_hash = data.get('password_hash')

        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password_hash):
            token = jwt.encode(
                {'user_id': user.user_id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
                SECRET_KEY,
                algorithm='HS256'
            )
            return jsonify({'token': token}), 200

        return jsonify({'message': 'Usuário ou senha inválidos'}), 401

    return users_bp
