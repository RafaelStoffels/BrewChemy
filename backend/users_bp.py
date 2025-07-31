from flask import Blueprint, request, jsonify, redirect, session, current_app
import jwt
import datetime
import os
import random
import string
from db import db
from flask_mail import Message
from models import User
from requests_oauthlib import OAuth2Session
from werkzeug.security import generate_password_hash
from AuthTokenVerifier import token_required


SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')
CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')

BACKEND_URL = os.getenv('BACKEND_URL')
FRONTEND_URL = os.getenv('FRONTEND_URL')
REDIRECT_URI = os.getenv('BACKEND_URL') + "/api/callback"

# URLs do Google OAuth
SCOPE = ["openid", "profile", "email"]
AUTHORIZATION_BASE_URL = "https://accounts.google.com/o/oauth2/auth"
TOKEN_URL = "https://accounts.google.com/o/oauth2/token"


def generate_state():
    """Function to generate a random value for the state"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=32))


def generate_temp_password():
    length = 12
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for i in range(length))


def create_users_bp():
    users_bp = Blueprint("users", __name__)

    def send_confirmation_email(user):
        try:
            msg = Message(
                subject="Registration Confirmation",
                sender=current_app.config['MAIL_DEFAULT_SENDER'],
                recipients=[user.email]
            )
            msg.body = (
                f"Hello {user.name},\n\n"
                "Click the link below to confirm your registration:\n"
                f"{BACKEND_URL}/api/confirm?email={user.email}\n\n"
                "If you did not request this registration, please ignore this email.\n\n"
                "Best regards,\nThe Brewchemy Team"
            )

            mail = current_app.extensions["mail"]
            mail.send(msg)

            return True
        except Exception as e:
            return False

    @users_bp.route("/confirm", methods=["GET"])
    def confirm_user():
        email = request.args.get("email")

        if not email:
            return jsonify({"error": "Email is required"}), 400

        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if user.status == "active":
            return jsonify({"message": "User is already active"}), 400

        user.status = "active"
        db.session.commit()

        return redirect(f"{FRONTEND_URL}")

    @users_bp.route("/sendPasswordResetEmail", methods=["POST"])
    def sendPasswordResetEmail():
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "Email is required"}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        try:
            token = jwt.encode(
                {"email": email, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
                current_app.config["SECRET_KEY"],
                algorithm="HS256"
            )

            reset_link = f"{FRONTEND_URL}/ChangePassword?token={token}"

            msg = Message(
                subject="Change Password",
                sender=current_app.config["MAIL_DEFAULT_SENDER"],
                recipients=[email]
            )
            msg.body = (
                "Click the link below to reset your password:\n"
                f"{reset_link}\n\n"
                "If you did not request this, please ignore this email.\n\n"
                "Best regards,\nThe Brewchemy Team"
            )

            mail = current_app.extensions["mail"]
            mail.send(msg)

            return jsonify({"message": "Email sent successfully"}), 200

        except Exception as e:
            return jsonify({"error": "Failed to send email", "details": str(e)}), 500

    @users_bp.route("/changePassword", methods=["POST"])
    def changePassword():
        data = request.get_json()
        token = data.get("token")
        password = data.get("password")

        if not token:
            return jsonify({"error": "Token is required"}), 400
        if not password:
            return jsonify({"error": "Field 'password' is mandatory"}), 400

        try:
            decoded_token = jwt.decode(
                token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
            )
            email = decoded_token.get("email")

            user = User.query.filter_by(email=email).first()
            if not user:
                return jsonify({"error": "User not found"}), 404

            user.password_hash = generate_password_hash(password)
            db.session.commit()

            return jsonify({"message": "Password changed successfully"}), 200

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 400
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 400

    @users_bp.route("/users", methods=["GET"])
    def get_users():
        users = User.query.all()
        return jsonify([user.to_dict() for user in users])

    @users_bp.route("/users/me", methods=["GET"])
    @token_required
    def get_user(user_id):
        user = User.query.get(user_id)

        if user is None:
            return jsonify({"message": "User not found"}), 404

        return jsonify({
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email
        })


    @users_bp.route("/users", methods=["POST"])
    def add_user():
        data = request.json
        email = data.get("email")

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "Email already registered."}), 400

        new_user = User(
            user_id=random.randint(1, 1000000),
            name=data.get("name"),
            email=email,
            password_hash=generate_password_hash(data.get("password")),
            brewery=data.get("brewery"),
            status="pending"
        )

        db.session.add(new_user)
        db.session.commit()

        email_sent = send_confirmation_email(new_user)

        if not email_sent:
            return jsonify({"message": "User created, but failed to send email."}), 500

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
        return jsonify({"message": f"User {user_id} deleted successfully"}), 200

    @users_bp.route("/login", methods=["POST"])
    def login():
        try:
            data = request.json
            email = data.get('email')
            password_hash = data.get('password')

            if not email or not password_hash:
                return jsonify({'message': 'Email and password are required'}), 400

            user = User.query.filter_by(email=email).first()

            if user and user.status == "active":
                if user.check_password(password_hash):

                    user.last_login = datetime.datetime.utcnow()

                    db.session.commit()

                    token = jwt.encode(
                        {
                            'user_id': user.user_id,
                            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8)
                        },
                        SECRET_KEY,
                        algorithm='HS256'
                    )
                    return jsonify({'token': token}), 200
                else:
                    return jsonify({'message': 'Invalid password'}), 401
            else:
                return jsonify({'message': 'User account is not active or does not exist'}), 401

        except Exception as e:
            return jsonify({'message': f'An error occurred: {str(e)}'}), 500

    @users_bp.route("/google-login")
    def google_login():
        google = OAuth2Session(
            CLIENT_ID,
            redirect_uri=REDIRECT_URI,
            scope=["openid", "email", "profile"]
        )
        authorization_url, state = google.authorization_url(
            AUTHORIZATION_BASE_URL,
            access_type="offline",
            prompt="select_account"
        )

        session['oauth_state'] = state  # ⚠️ keep state in session

        return redirect(authorization_url)  # redirect to google

    @users_bp.route("/callback", methods=["GET"])
    def callback():
        # state returned by google - def google_login
        state = request.args.get('state')

        if state != session.get('oauth_state'):
            return jsonify({"error": "Invalid state"}), 400

        # Creating OAuth2 using token
        google = OAuth2Session(CLIENT_ID, redirect_uri=REDIRECT_URI, state=session['oauth_state'])

        token = google.fetch_token(
            TOKEN_URL,
            client_secret=CLIENT_SECRET,
            authorization_response=request.url
        )

        session['oauth_token'] = token

        # user infos
        user_info = google.get("https://www.googleapis.com/oauth2/v3/userinfo").json()
        google_id = user_info.get("sub")  # "sub" contais googleId

        # user exists?
        user = User.query.filter(
            (User.email == user_info.get("email")) | (User.google_id == google_id)
        ).first()

        try:
            if not user:
                temp_password = generate_temp_password()

                user = User(
                    user_id=random.randint(1, 1000000),
                    name=user_info.get("name"),
                    email=user_info.get("email"),
                    google_id=google_id,
                    password_hash=generate_password_hash(temp_password),
                    brewery=None,
                    status='active'
                )

                db.session.add(user)
                db.session.commit()
            else:
                if not user.google_id:
                    user.google_id = google_id
                    db.session.commit()

        except Exception as e:
            db.session.rollback()

        token = jwt.encode(
            {
                'user_id': user.user_id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8),
                'iat': datetime.datetime.utcnow(),
                'nbf': datetime.datetime.utcnow()
            },
            SECRET_KEY,
            algorithm='HS256'
        )

        return redirect(f"{FRONTEND_URL}/?token={token}")

    @users_bp.route("/resend_confirmation", methods=["POST"])
    def resend_confirmation():
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "Email is required"}), 400

        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if user.status == "active":
            return jsonify({"message": "User already active"}), 400

        email_sent = send_confirmation_email(user)

        if not email_sent:
            return jsonify({"error": "Error resending email"}), 500

        return jsonify({"message": "Confirmation email resent"}), 200

    return users_bp
