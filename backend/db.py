from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()  # Declare db object here to be used across the app

def configure_db(app):
    # Configuração do banco de dados
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:P4p3P2p1%2A@localhost:5432/brewchemy"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Inicializando o db
    db.init_app(app)