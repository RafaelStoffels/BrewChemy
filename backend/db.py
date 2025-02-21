from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

load_dotenv()  # Carrega as variáveis de ambiente do arquivo .env

db = SQLAlchemy()  # Declare db object here to be used across the app

def configure_db(app):

    # Lógica para verificar se estamos no ambiente de produção ou desenvolvimento
    if os.getenv('ENVIRONMENT') == 'production':
        db_uri = f"postgresql://{os.getenv('DB_USER_PROD')}:{os.getenv('DB_PASSWORD_PROD')}@{os.getenv('DB_HOST_PROD')}:{os.getenv('DB_PORT_PROD')}/{os.getenv('DB_NAME_PROD')}"
    else:
        db_uri = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"

    # Configuração do banco de dados no Flask
    app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Inicializando o db
    db.init_app(app)
