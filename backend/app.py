from flask import Flask, jsonify
from flask_cors import CORS
from db import db, configure_db
from malts_bp import create_malts_bp
from users_bp import create_users_bp

# Inicializando Flask
app = Flask(__name__)

# Configura o banco de dados
configure_db(app)

# Inicializando CORS
CORS(app)

# Função para criar a aplicação
def create_app():
    # Registra o blueprint com as rotas
    app.register_blueprint(create_malts_bp(), url_prefix="/api")
    app.register_blueprint(create_users_bp(), url_prefix="/api/")
    
    # Retorna a instância do app
    return app

# Rota principal
@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({'message': 'get malt!'})

# Roda o servidor Flask
if __name__ == "__main__":
    # Garantir que o db seja inicializado antes de rodar o app
    with app.app_context():
        db.create_all()  # Cria as tabelas no banco de dados
    create_app().run(debug=True)


#python app.py
#http://localhost:5000.
