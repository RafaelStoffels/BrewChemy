import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from db import db, configure_db
from routes.openai_bp import openai_route
from flask_mail import Mail
from flask_migrate import Migrate

from routes.equipments_bp import create_equipments_bp
from routes.fermentables_bp import create_fermentables_bp
from routes.hops_bp import create_hops_bp
from routes.misc_bp import create_misc_bp
from routes.yeasts_bp import create_yeasts_bp
from routes.recipes_bp import create_recipes_bp
from routes.copy_recipe_bp import create_copy_recipe_bp
from routes.users_bp import create_users_bp


mail = Mail()


def create_app():
    app = Flask(__name__)

    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = os.getenv('MAIL_PORT')
    app.config['MAIL_USE_TLS'] = False
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

    mail.init_app(app)

    # Handle Sessions - secure and unique
    app.secret_key = os.getenv('FLASK_SECRET_KEY', os.urandom(24))

    configure_db(app)

    # CORS ALLOWED
    # CORS(app, resources={r"/api/*": {"origins": "*"}})
    # CORS(app, resources={r"/api/*": {"origins": "http://localhost:5000"}})

    migrate = Migrate(app, db)

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
        return jsonify({'message': 'Welcome app!'})

    return app


if __name__ == "__main__":
    app = create_app()

    # Absolute path to the SSL certificates
    ssl_cert_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ssl', 'cert.pem')
    ssl_key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ssl', 'private.key')

    app.run(ssl_context=(ssl_cert_path, ssl_key_path), debug=True)
