# backend/db.py
from flask_sqlalchemy import SQLAlchemy
import os, pathlib
from dotenv import load_dotenv

load_dotenv()
db = SQLAlchemy()

def configure_db(app):
    
    in_docker = pathlib.Path("/.dockerenv").exists()
    if not in_docker:
        try:
            from dotenv import load_dotenv
            load_dotenv()
        except Exception:
            pass

    db_uri = os.getenv("DATABASE_URL")
    if not db_uri:
        user = os.getenv("DB_USER", "postgres")
        pwd  = os.getenv("DB_PASSWORD", "brewchemy")
        host = os.getenv("DB_HOST", "db" if in_docker else "localhost")
        port = os.getenv("DB_PORT", "5432" if in_docker else "5433")
        name = os.getenv("DB_NAME", "brewchemy")
        
        db_uri = f"postgresql+psycopg2://{user}:{pwd}@{host}:{port}/{name}"

    app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
