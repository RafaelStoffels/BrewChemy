from flask import Flask, jsonify
from flask_cors import CORS
from db import db
from malts_bp import create_malts_bp

# Inicializando Flask
app = Flask(__name__)

# Configuração do banco de dados
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:P4p3P2p1%2A@localhost:5432/brewchemy"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Inicializando o db
db.init_app(app)

# Inicializando CORS
CORS(app)

# Função para criar a aplicação
def create_app():
    # Registra o blueprint com as rotas
    app.register_blueprint(create_malts_bp(), url_prefix="/api")
    return app

# Rota principal
@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({'message': 'get malt!'})

# Roda o servidor Flask
if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Cria as tabelas no banco de dados
    create_app().run(debug=True)


#python app.py
#http://localhost:5000.
