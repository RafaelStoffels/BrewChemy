from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

load_dotenv()  # Loads environment variables from the .env file

db = SQLAlchemy()


def configure_db(app):

    if os.getenv('ENVIRONMENT') == 'production':
        db_uri = (
            f"postgresql://{os.getenv('DB_USER_PROD')}:{os.getenv('DB_PASSWORD_PROD')}"
            f"@{os.getenv('DB_HOST_PROD')}:{os.getenv('DB_PORT_PROD')}/{os.getenv('DB_NAME_PROD')}"
        )
    else:
        db_uri = (
            f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
            f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
        )

    # Database configuration in Flask
    app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
