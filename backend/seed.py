from app import create_app, db
from models import User
from datetime import datetime

app = create_app()

with app.app_context():
    if not User.query.first():
        admin = User(
            user_id=1,
            name='Adm',
            email='adm@brewchemy.com',
            password_hash='scrypt:32768:8:1$cyo8VBOw3cYzpeRj$5f77dc2692431c750199ec702b4b1c161bbe23e31b63e4bf348970a875be3e96915ea094a3545f9ab979937f83eac6d79cd4469d138600b911379bf82870893b',
            brewery='',
            created_at=datetime.utcnow(),
            last_login=None,
            is_active=True,
            google_id=None,
            status='active'
        )
        db.session.add(admin)
        db.session.commit()
        print("Adm user created.")
    else:
        print("Adm user already exists.")
