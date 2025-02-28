from flask import Blueprint, request, jsonify, redirect, session, current_app
import jwt
import datetime
import os
import random
import string
from db import db
from flask_mail import Mail, Message
from models import User
from requests_oauthlib import OAuth2Session

mail = Mail()

SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')
CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')


if os.getenv('ENVIRONMENT') == 'production':
    FRONTEND_URL = os.getenv('FRONTEND_URL_PROD')
    REDIRECT_URI = os.getenv('BACKEND_URL_PROD') + "/api/callback"
else:
    FRONTEND_URL = os.getenv('FRONTEND_URL')
    REDIRECT_URI = os.getenv('BACKEND_URL') + "/api/callback"

print(REDIRECT_URI)

# URLs do Google OAuth
SCOPE = ["openid", "profile", "email"]
AUTHORIZATION_BASE_URL = "https://accounts.google.com/o/oauth2/auth"
TOKEN_URL = "https://accounts.google.com/o/oauth2/token"


def generate_state():
    """Função para gerar um valor aleatório para o state"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

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
        return jsonify({"message": "Confirmation email sent!"}), 200


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
            return jsonify({"message": "User not found"}), 404

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
                current_app.secret_key,
                algorithm='HS256'
            )
            return jsonify({'token': token}), 200

        return jsonify({'message': 'Invalid password or user account'}), 401

    
    @users_bp.route("/google-login")
    def google_login():
        google = OAuth2Session(CLIENT_ID, redirect_uri=REDIRECT_URI, scope=["openid", "email", "profile"])
        authorization_url, state = google.authorization_url(AUTHORIZATION_BASE_URL, access_type="offline", prompt="select_account")

        session['oauth_state'] = state  # ⚠️ Salva o state na sessão

        print("authorization_url: ", authorization_url)

        return redirect(authorization_url)  # Redireciona para o Google
    

    @users_bp.route("/callback", methods=["GET"])
    def callback():
        print("Callback iniciado")
    
        # O estado retornado pelo Google
        state = request.args.get('state')
        
        # Verifica se o estado da URL é o mesmo armazenado na sessão
        if state != session.get('oauth_state'):
            return jsonify({"error": "State invalido"}), 400
    
        # Agora, criamos uma sessão OAuth2 com o token de acesso
        google = OAuth2Session(CLIENT_ID, redirect_uri=REDIRECT_URI, state=session['oauth_state'])
        
        # Obtém o token de acesso
        token = google.fetch_token(TOKEN_URL, client_secret=CLIENT_SECRET, authorization_response=request.url)
    
        # Armazena o token de autenticação na sessão
        session['oauth_token'] = token
    
        # Recupera informações do usuário autenticado no Google
        user_info = google.get("https://www.googleapis.com/oauth2/v3/userinfo").json()
        google_id = user_info.get("sub")  # O "sub" é o Google ID único do usuário
    
        print(f"Informações do usuário: {user_info}")
    
        # Verifica se o usuário já existe no banco de dados
        user = User.query.filter(
            (User.email == user_info.get("email")) | (User.google_id == google_id)
        ).first()
    
        if not user:
            # Cria um novo usuário com as informações do Google
            user = User(
                name=user_info.get("name"),
                email=user_info.get("email"),
                google_id=google_id,  # Armazena o Google ID
                password_hash=None,  # Sem senha para usuários do Google
                brewery=None  # Preenchido depois, se necessário
            )
            db.session.add(user)
            db.session.commit()
        else:
            # Se o usuário já existe, mas não tem o Google ID, atualiza o Google ID
            if not user.google_id:
                user.google_id = google_id
                db.session.commit()
    
        # Cria um token JWT para o usuário
        token = jwt.encode(
            {
                'user_id': user.user_id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8),
                'iat': datetime.datetime.utcnow(),
                'nbf': datetime.datetime.utcnow()
            },
            current_app.secret_key,
            algorithm='HS256'
        )
    
        return redirect(f"{FRONTEND_URL}/?token={token}")

    return users_bp
