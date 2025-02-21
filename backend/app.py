from flask import Flask, jsonify, request
from flask_cors import CORS
from db import db, configure_db
from openai_bp import openai_route
from flask_mail import Mail

# Inventory imports
from routes.equipments_bp import create_equipments_bp
from routes.fermentables_bp import create_fermentables_bp
from routes.hops_bp import create_hops_bp
from routes.misc_bp import create_misc_bp
from routes.yeasts_bp import create_yeasts_bp
from recipes_bp import create_recipes_bp
from copy_recipe_bp import create_copy_recipe_bp
from users_bp import create_users_bp


def create_app():
    # Configuração do app
    app = Flask(__name__)

    # Configuração do banco de dados
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

    # Rota principal
    @app.route('/api/data', methods=['GET'])
    def get_data():
        return jsonify({'message': 'get fermentable!'})

    return app

if __name__ == "__main__":
    app = create_app()

    # Garantir que o db seja inicializado antes de rodar o app
    with app.app_context():
        db.create_all()  # Cria as tabelas no banco de dados

    app.run(debug=True)