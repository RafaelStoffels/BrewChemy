from flask import Blueprint, request, jsonify
import jwt
import datetime
import os
from db import db
from flask_mail import Mail, Message
from models import User

mail = Mail()

SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')


def create_users_bp():
    users_bp = Blueprint("users", __name__)

    @users_bp.route("/send_email", methods=["POST"])
    def send_email():
        msg = Message(
            "Confirmação de Cadastro",
            recipients=["destinatario@example.com"],
        )
        msg.body = "Clique no link para confirmar seu cadastro."
        mail.send(msg)
        return jsonify({"message": "E-mail de confirmação enviado!"}), 200


    @users_bp.route("/users", methods=["GET"])
    def get_users():
        users = User.query.all()
        return jsonify([user.to_dict() for user in users])


    @users_bp.route("/users/<int:user_id>", methods=["GET"])
    def get_user(user_id):
        user = User.query.get(user_id)

        if user is None:
            return jsonify({"message": "User not found"}), 404

        return jsonify(user.to_dict())


    @users_bp.route("/users", methods=["POST"])
    def add_user():
        data = request.json
        new_user = User(
            name=data.get("name"),
            email=data.get("email"),
            password_hash=data.get("password"),
            brewery=data.get("brewery"),
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict()), 201


    @users_bp.route("/users/<int:user_id>", methods=["PUT"])
    def update_user(user_id):
        user = User.query.get(user_id)

        if user is None:
            return jsonify({"message": "Usuário não encontrado"}), 404

        data = request.json

        user.name = data.get("name", user.name)
        user.email = data.get("email", user.email)

        new_password = data.get("password")

        print(new_password)

        if new_password:
            user.set_password(new_password)

        user.brewery = data.get("brewery", user.brewery)
        user.is_active = data.get("is_active", user.is_active)

        db.session.commit()
        return jsonify(user.to_dict()), 200


    @users_bp.route("/users/<int:user_id>", methods=["DELETE"])
    def delete_user(user_id):
        user = User.query.get(user_id)

        if user is None:
            return jsonify({"message": "User not found"}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": f"Usuário com ID {user_id} foi deletado com sucesso"}), 200


    @users_bp.route("/login", methods=["POST"])
    def login():
        data = request.json
        email = data.get('email')
        password_hash = data.get('password')

        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password_hash):
            token = jwt.encode(
                {'user_id': user.user_id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8)},
                SECRET_KEY,
                algorithm='HS256'
            )
            return jsonify({'token': token}), 200

        return jsonify({'message': 'Invalid password or user account'}), 401

    return users_bp
