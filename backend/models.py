# models.py
from werkzeug.security import generate_password_hash, check_password_hash
from db import db
from datetime import datetime


class Equipment(db.Model):
    __tablename__ = 'equipments'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    official_id = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    efficiency = db.Column(db.Numeric(5, 2), nullable=False)
    batch_volume = db.Column(db.Numeric(10, 2), nullable=False)
    batch_time = db.Column(db.Integer)
    boil_time = db.Column(db.Integer)
    boil_temperature = db.Column(db.Numeric(5, 2), nullable=False)
    boil_off = db.Column(db.Numeric(5, 2))
    trub_loss = db.Column(db.Numeric(5, 2))
    dead_space = db.Column(db.Numeric(5, 2))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "officialId": self.official_id,
            "userId": self.user_id,
            "name": self.name,
            "description": self.description,
            "efficiency": float(self.efficiency),
            "batchVolume": float(self.batch_volume),
            "batchTime": self.batch_time,
            "boilTime": self.boil_time,
            "boilTemperature": float(self.boil_temperature),
            "boilOff": float(self.boil_off),
            "trubLoss": float(self.trub_loss),
            "deadSpace": float(self.dead_space),
            "createdAt": self.created_at.isoformat()
        }


class Fermentable(db.Model):
    __tablename__ = 'fermentables'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    official_id = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    description = db.Column(db.Text)
    ebc = db.Column(db.Numeric(5, 2))
    potential_extract = db.Column(db.Numeric(5, 3), nullable=False)
    type = db.Column(db.String(15), nullable=False)
    stock_quantity = db.Column(db.Integer)
    supplier = db.Column(db.String(40))
    unit_price = db.Column(db.Numeric(10, 2))

    def to_dict(self):
        return {
            "id": self.id,
            "officialId": self.official_id,
            "userId": self.user_id,
            "name": self.name,
            "description": self.description,
            "ebc": float(self.ebc),
            "potentialExtract": float(self.potential_extract),
            "type": self.type,
            "supplier": self.supplier,
        }


class Hop(db.Model):
    __tablename__ = 'hops'

    id = db.Column(db.Integer, primary_key=True)
    official_id = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    supplier = db.Column(db.String(40))
    alpha_acid_content = db.Column(db.Numeric(5, 2))
    beta_acid_content = db.Column(db.Numeric(5, 2))
    type = db.Column(db.String(15))
    country_of_origin = db.Column(db.String(50))
    description = db.Column(db.Text)
    use_type = db.Column(db.String(15))

    def to_dict(self):
        return {
            "id": self.id,
            "officialId": self.official_id,
            "userId": self.user_id,
            "name": self.name,
            "supplier": self.supplier,
            "alphaAcidContent": float(self.alpha_acid_content) if self.alpha_acid_content else None,
            "betaAcidContent": float(self.beta_acid_content) if self.beta_acid_content else None,
            "type": self.type,
            "useType": self.use_type,
            "countryOfOrigin": self.country_of_origin,
            "description": self.description
        }


class Misc(db.Model):
    __tablename__ = 'misc'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    official_id = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(15))

    def to_dict(self):
        return {
            "id": self.id,
            "officialId": self.official_id,
            "userId": self.user_id,
            "name": self.name,
            "description": self.description,
            "type": self.type,
        }


class Yeast(db.Model):
    __tablename__ = 'yeasts'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    official_id = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    manufacturer = db.Column(db.String(60))
    type = db.Column(db.String(15))
    form = db.Column(db.String(15))
    attenuation = db.Column(db.Numeric(5, 2))
    temperature_range = db.Column(db.String(15))
    flavor_profile = db.Column(db.String(100))
    flocculation = db.Column(db.String(15))
    description = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "officialId": self.official_id,
            "userId": self.user_id,
            "name": self.name,
            "manufacturer": self.manufacturer,
            "type": self.type,
            "form": self.form,
            "attenuation": float(self.attenuation) if self.attenuation else None,
            "temperatureRange": self.temperature_range,
            "flavorProfile": self.flavor_profile,
            "flocculation": self.flocculation,
            "description": self.description,
        }


class Recipe(db.Model):
    __tablename__ = 'recipes'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    style = db.Column(db.String(30))
    description = db.Column(db.Text)
    creation_date = db.Column(db.Date, default=db.func.current_date())
    notes = db.Column(db.Text)
    author = db.Column(db.String(40), nullable=False)
    type = db.Column(db.String(20), nullable=False)

    recipe_equipment = db.relationship(
        'RecipeEquipment',
        backref='recipe',
        lazy=True,
        cascade="all, delete-orphan",
        uselist=False
    )
    recipe_fermentables = db.relationship(
        'RecipeFermentable',
        backref='recipe',
        lazy=True,
        cascade="all, delete-orphan"
    )
    recipe_hops = db.relationship(
        'RecipeHop',
        backref='recipe',
        lazy=True,
        cascade="all, delete-orphan"
    )
    recipe_misc = db.relationship(
        'RecipeMisc',
        backref='recipe',
        lazy=True,
        cascade="all, delete-orphan"
    )
    recipe_yeasts = db.relationship(
        'RecipeYeast',
        backref='recipe',
        lazy=True,
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        # Checks if there is any equipment associated with the recipe
        recipe_equipment = self.recipe_equipment if self.recipe_equipment else None

        return {
            "id": self.id,
            "userId": self.user_id,
            "name": self.name,
            "style": self.style,
            "description": self.description,
            "creationDate": self.creation_date.isoformat() if self.creation_date else None,
            "notes": self.notes,
            "author": self.author,
            "type": self.type,
            "recipeEquipment": recipe_equipment.to_dict() if recipe_equipment else None,
            "recipeFermentables": [
                fermentable.to_dict() for fermentable in self.recipe_fermentables
            ],
            "recipeHops": [hop.to_dict() for hop in self.recipe_hops],
            "recipeMisc": [misc.to_dict() for misc in self.recipe_misc],
            "recipeYeasts": [yeast.to_dict() for yeast in self.recipe_yeasts]
        }


class RecipeEquipment(db.Model):
    __tablename__ = 'recipe_equipment'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    efficiency = db.Column(db.Numeric(5, 2), nullable=False)
    batch_volume = db.Column(db.Numeric(10, 2), nullable=False)
    boil_time = db.Column(db.Integer, nullable=False)
    boil_temperature = db.Column(db.Numeric(5, 2), nullable=False)
    batch_time = db.Column(db.Integer)
    boil_off = db.Column(db.Numeric(5, 2))
    dead_space = db.Column(db.Numeric(5, 2))
    trub_loss = db.Column(db.Numeric(5, 2))

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "recipeId": self.recipe_id,
            "name": self.name,
            "description": self.description,
            "efficiency": float(self.efficiency) if self.efficiency else None,
            "batchVolume": float(self.batch_volume) if self.batch_volume else None,
            "boilTime": self.boil_time,
            "boilTemperature": float(self.boil_temperature) if self.boil_temperature else None,
            "batchTime": self.batch_time,
            "boilOff": float(self.boil_off) if self.boil_off else None,
            "deadSpace": float(self.dead_space) if self.dead_space else None,
            "trubLoss": float(self.trub_loss) if self.trub_loss else None,
        }


class RecipeFermentable(db.Model):
    __tablename__ = 'recipe_fermentables'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    description = db.Column(db.Text)
    ebc = db.Column(db.Numeric(5, 2), nullable=False)
    potential_extract = db.Column(db.Numeric(5, 3), nullable=False)
    type = db.Column(db.String(15))
    supplier = db.Column(db.String(40))
    unit_price = db.Column(db.Numeric(10, 2))
    quantity = db.Column(db.Numeric, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "recipeId": self.recipe_id,
            "name": self.name,
            "description": self.description,
            "ebc": float(self.ebc),
            "potentialExtract": float(self.potential_extract),
            "type": self.type,
            "supplier": self.supplier,
            "unitPrice": float(self.unit_price) if self.unit_price else None,
            "quantity": float(self.quantity) if self.quantity else None
        }


class RecipeHop(db.Model):
    __tablename__ = 'recipe_hops'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    alpha_acid_content = db.Column(db.Numeric(5, 2))
    beta_acid_content = db.Column(db.Numeric(5, 2))
    use_type = db.Column(db.String(15))
    country_of_origin = db.Column(db.String(50))
    description = db.Column(db.Text)
    quantity = db.Column(db.Numeric, nullable=False)
    boil_time = db.Column(db.Integer)
    usage_stage = db.Column(db.String(15))

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "recipeId": self.recipe_id,
            "name": self.name,
            "alphaAcidContent": float(self.alpha_acid_content) if self.alpha_acid_content else None,
            "betaAcidContent": float(self.beta_acid_content) if self.beta_acid_content else None,
            "useType": self.use_type,
            "countryOfOrigin": self.country_of_origin,
            "description": self.description,
            "quantity": float(self.quantity) if self.quantity else None,
            "boilTime": self.boil_time,
            "usageStage": self.usage_stage
        }


class RecipeMisc(db.Model):
    __tablename__ = 'recipe_misc'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(15))
    quantity = db.Column(db.Numeric, nullable=False)
    use = db.Column(db.String(15))
    time = db.Column(db.Integer)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "recipeId": self.recipe_id,
            "name": self.name,
            "description": self.description,
            "type": self.type,
            "quantity": float(self.quantity) if self.quantity else None,
            "use": self.use,
            "time": self.time
        }


class RecipeYeast(db.Model):
    __tablename__ = 'recipe_yeasts'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    manufacturer = db.Column(db.String(100))
    type = db.Column(db.String(15))
    form = db.Column(db.String(15))
    attenuation = db.Column(db.String(20))
    temperature_range = db.Column(db.String(15))
    flavor_profile = db.Column(db.Text)
    flocculation = db.Column(db.String(15))
    description = db.Column(db.Text)
    quantity = db.Column(db.Numeric, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,

            "recipeId": self.recipe_id,
            "name": self.name,
            "manufacturer": self.manufacturer,
            "type": self.type,
            "form": self.form,
            "attenuation": self.attenuation,
            "temperatureRange": self.temperature_range,
            "flavorProfile": self.flavor_profile,
            "flocculation": self.flocculation,
            "description": self.description,
            "quantity": float(self.quantity) if self.quantity else None
        }


class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())
    last_login = db.Column(db.TIMESTAMP)
    is_active = db.Column(db.Boolean)
    brewery = db.Column(db.String(60))
    google_id = db.Column(db.String(100), unique=True)
    status = db.Column(db.String(15))
    weight_unit = db.Column(db.String(5), default='g')

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "password": self.password_hash,
            "google_id": self.google_id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at,
            "last_login": self.last_login,
            "is_active": self.is_active,
            "brewery": self.brewery,
            "status": self.status,
            "weightUnit": self.weight_unit,
        }

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
