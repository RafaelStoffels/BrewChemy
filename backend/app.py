import os
from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
from db import db, configure_db
from openai_bp import openai_route
from flask_mail import Mail

from routes.equipments_bp import create_equipments_bp
from routes.fermentables_bp import create_fermentables_bp
from routes.hops_bp import create_hops_bp
from routes.misc_bp import create_misc_bp
from routes.yeasts_bp import create_yeasts_bp
from recipes_bp import create_recipes_bp
from copy_recipe_bp import create_copy_recipe_bp
from users_bp import create_users_bp


def create_app():
    app = Flask(__name__)

    # Definindo a chave secreta para gerenciar sessões
    app.secret_key = os.getenv('FLASK_SECRET_KEY', os.urandom(24))  # Garante que a chave seja única e segura

    configure_db(app)

    # Inicialização do Mail com a instância do app
    app.config.from_object('config.Config')
    mail = Mail(app)

    # Permite o uso de CORS
    #CORS(app, resources={r"/api/*": {"origins": "*"}})
    #CORS(app, resources={r"/api/*": {"origins": "http://localhost:5000"}})

    CORS(app)

    # Registro das blueprints
    app.register_blueprint(create_equipments_bp(), url_prefix="/api")
    app.register_blueprint(create_fermentables_bp(), url_prefix="/api")
    app.register_blueprint(create_hops_bp(), url_prefix="/api")
    app.register_blueprint(create_misc_bp(), url_prefix="/api")
    app.register_blueprint(create_yeasts_bp(), url_prefix="/api")

    app.register_blueprint(create_copy_recipe_bp(), url_prefix="/api/")
    app.register_blueprint(create_recipes_bp(), url_prefix="/api/")
    app.register_blueprint(openai_route(), url_prefix='/api')
    app.register_blueprint(create_users_bp(), url_prefix="/api/")

    @app.before_request
    def log_request_info():
        app.logger.debug('Request URL: %s', request.url)
        app.logger.debug('Request Method: %s', request.method)
        app.logger.debug('Request Headers: %s', request.headers)

    @app.route('/')
    def home():
        return jsonify({'message': 'Bem-vindo à aplicação!'})

    return app

if __name__ == "__main__":
    app = create_app()

    # Caminho absoluto para os certificados SSL
    ssl_cert_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ssl', 'cert.pem')
    ssl_key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ssl', 'private.key')

    # Garantir que o db seja inicializado antes de rodar o app
    with app.app_context():
        db.create_all()  # Cria as tabelas no banco de dados

    app.run(ssl_context=(ssl_cert_path, ssl_key_path), debug=True)