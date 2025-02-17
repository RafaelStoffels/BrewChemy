from flask import Flask, jsonify, request
from flask_cors import CORS
from db import db, configure_db
from openai_bp import openai_route

#Inventory
from routes.equipments_bp import create_equipments_bp
from routes.fermentables_bp import create_fermentables_bp
from routes.hops_bp import create_hops_bp
from routes.misc_bp import create_misc_bp
from routes.yeasts_bp import create_yeasts_bp

from recipes_bp import create_recipes_bp

from copy_recipe_bp import create_copy_recipe_bp

from users_bp import create_users_bp


app = Flask(__name__)

configure_db(app)

CORS(app)

def create_app():
    # Inventory
    app.register_blueprint(create_equipments_bp(), url_prefix="/api")
    app.register_blueprint(create_fermentables_bp(), url_prefix="/api")
    app.register_blueprint(create_hops_bp(), url_prefix="/api")
    app.register_blueprint(create_misc_bp(), url_prefix="/api")
    app.register_blueprint(create_yeasts_bp(), url_prefix="/api")

    app.register_blueprint(create_copy_recipe_bp(), url_prefix="/api/")
    app.register_blueprint(create_recipes_bp(), url_prefix="/api/")
    app.register_blueprint(openai_route(), url_prefix='/api')
    app.register_blueprint(create_users_bp(), url_prefix="/api/")

    return app

# Rota principal
@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({'message': 'get fermentable!'})

# Roda o servidor Flask
if __name__ == "__main__":
    # Garantir que o db seja inicializado antes de rodar o app
    with app.app_context():
        db.create_all()  # Cria as tabelas no banco de dados
    create_app().run(debug=True)


#python app.py
#http://localhost:5000.
