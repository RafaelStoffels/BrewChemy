# models.py
from db import db
from datetime import datetime

class Equipment(db.Model):
    __tablename__ = 'equipments'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    efficiency = db.Column(db.Numeric(5, 2), nullable=False)
    batch_volume = db.Column(db.Numeric(10, 2), nullable=False)
    batch_time = db.Column(db.Integer, nullable=False)
    boil_time = db.Column(db.Integer, nullable=False)
    boil_temperature = db.Column(db.Numeric(5, 2), nullable=False)
    boil_off = db.Column(db.Numeric(5, 2), nullable=False)
    trub_loss = db.Column(db.Numeric(5, 2), nullable=False)
    dead_space = db.Column(db.Numeric(5, 2), nullable=False)


    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Convert snake_case to camelCase in JSON
    def to_dict(self):
        return {
            "id": self.id,
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
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    description = db.Column(db.Text)
    ebc = db.Column(db.Numeric(5, 2), nullable=False)
    potential_extract = db.Column(db.Numeric(5, 3), nullable=False)
    type = db.Column(db.String(15), nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False)
    supplier = db.Column(db.String(40), nullable=False)
    unit_price = db.Column(db.Numeric(10, 2))
    official_fermentable_id = db.Column(db.Integer, nullable=False)

    # Converte snake_case para camelCase no JSON
    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "name": self.name,
            "description": self.description,
            "ebc": float(self.ebc),
            "potentialExtract": float(self.potential_extract),
            "type": self.type,
            "supplier": self.supplier,
            "officialFermentableId": self.official_fermentable_id
        }

class Hop(db.Model):
    __tablename__ = 'hops'

    id = db.Column(db.Integer, primary_key=True)
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
            "userId": self.user_id,
            "name": self.name,
            "supplier": self.supplier,
            "alphaAcidContent": float(self.alpha_acid_content) if self.alpha_acid_content else None,
            "betaAcidContent": float(self.beta_acid_content) if self.beta_acid_content else None,
            "type": self.type,
            "useType": self.use_type,
            "countryOfOrigin": self.country_of_origin,
            "description": self.description,
        } 

class Misc(db.Model):
    __tablename__ = 'misc'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(15))

    # Convert snake_case to camelCase in JSON
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "type": self.type,
        }
    
class Yeast(db.Model):
    __tablename__ = 'yeasts'

    # Table Definition
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    manufacturer = db.Column(db.String(60))
    type = db.Column(db.String(15))
    form = db.Column(db.String(15))
    attenuation = db.Column(db.Numeric(5, 2))
    temperature_range = db.Column(db.String(15))
    alcohol_tolerance = db.Column(db.String(15))
    flavor_profile = db.Column(db.String(100))
    flocculation = db.Column(db.String(15))
    description = db.Column(db.Text)

    # Convert snake_case to camelCase in JSON
    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "name": self.name,
            "manufacturer": self.manufacturer,
            "type": self.type,
            "form": self.form,
            "attenuation": float(self.attenuation) if self.attenuation else None,
            "temperatureRange": self.temperature_range,
            "alcoholTolerance": self.alcohol_tolerance,
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
    volume_liters = db.Column(db.Numeric(5, 2))
    equipment_id = db.Column(db.Integer)
    notes = db.Column(db.Text)
    author = db.Column(db.String(40), nullable=False)
    type = db.Column(db.String(20), nullable=False)

    recipe_equipment = db.relationship('RecipeEquipment', backref='recipe')
    recipe_fermentables = db.relationship('RecipeFermentable', backref='recipe', lazy=True, cascade="all, delete-orphan")
    recipe_hops = db.relationship('RecipeHop', backref='recipe', lazy=True, cascade="all, delete-orphan")
    recipe_misc = db.relationship('RecipeMisc', backref='recipe', lazy=True, cascade="all, delete-orphan")
    recipe_yeasts = db.relationship('RecipeYeast', backref='recipe', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        # Verifica se existe algum equipamento associado à receita
        recipe_equipment = self.recipe_equipment[0] if self.recipe_equipment else None

        return {
            "id": self.id,
            "userId": self.user_id,
            "name": self.name,
            "style": self.style,
            "description": self.description,
            "creationDate": self.creation_date.isoformat() if self.creation_date else None,
            "volumeLiters": float(self.volume_liters) if self.volume_liters else None,
            "notes": self.notes,
            "author": self.author,
            "type": self.type,
            "recipeEquipment": recipe_equipment.to_dict() if recipe_equipment else None,
            "recipeFermentables": [fermentable.to_dict() for fermentable in self.recipe_fermentables],
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
    batch_time = db.Column(db.Integer, nullable=False)
    boil_off = db.Column(db.Numeric(5, 2), nullable=False)
    dead_space = db.Column(db.Numeric(5, 2), nullable=False)
    trub_loss = db.Column(db.Numeric(5, 2), nullable=False)

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
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    description = db.Column(db.Text)
    ebc = db.Column(db.Numeric(5, 2), nullable=False)
    potential_extract = db.Column(db.Numeric(5, 3), nullable=False)
    type = db.Column(db.String(15))
    supplier = db.Column(db.String(40))
    unit_price = db.Column(db.Numeric(10, 2))
    notes = db.Column(db.Text)
    quantity = db.Column(db.Numeric)

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
            "notes": self.notes,
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
    quantity = db.Column(db.Numeric)
    boil_time = db.Column(db.Integer)

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
            "boilTime": self.boil_time
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
    quantity = db.Column(db.Numeric)
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
    manufacturer = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(15), nullable=False)
    form = db.Column(db.String(15), nullable=False)
    attenuation = db.Column(db.String(20), nullable=False)
    temperature_range = db.Column(db.String(15), nullable=False)
    alcohol_tolerance = db.Column(db.String(15), nullable=False)
    flavor_profile = db.Column(db.Text) 
    flocculation = db.Column(db.String(15), nullable=False)
    description = db.Column(db.Text)
    quantity = db.Column(db.Numeric)

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
            "alcoholTolerance": self.alcohol_tolerance,
            "flavorProfile": self.flavor_profile,
            "flocculation": self.flocculation,
            "description": self.description,
            "quantity": float(self.quantity) if self.quantity else None
        }