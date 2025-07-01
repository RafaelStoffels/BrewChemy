from marshmallow import Schema, fields, validates, ValidationError, EXCLUDE

class HopsSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    itemUserId = fields.Int(load_only=True)
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    supplier = fields.Str(allow_none=True)
    alphaAcidContent = fields.Decimal(as_string=True, allow_none=True)
    betaAcidContent = fields.Decimal(as_string=True, allow_none=True)
    type = fields.Str(required=True)
    countryOfOrigin = fields.Str(allow_none=True)
    description = fields.Str(allow_none=True)
    useType = fields.Str(required=True)

    VALID_TYPES = {"Pellet", "Whole", "Cryo", "CO2 Extract"}
    VALID_USE_TYPES = {"Boil", "Dry Hop", "Aroma", "Mash", "First Wort"}

    @validates("name")
    def validate_name(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Name must not be empty.")
        if len(value) > 40:
            raise ValidationError("Name must be at most 40 characters long.")

    @validates("supplier")
    def validate_supplier(self, value, *args, **kwargs):
        if value and len(value) > 40:
            raise ValidationError("Supplier name must be at most 40 characters long.")

    @validates("alphaAcidContent")
    def validate_alpha_acid_content(self, value, *args, **kwargs):
        if value is not None and (value < 0 or value > 30):
            raise ValidationError("Alpha acid content must be between 0 and 30%.")

    @validates("betaAcidContent")
    def validate_beta_acid_content(self, value, *args, **kwargs):
        if value is not None and (value < 0 or value > 30):
            raise ValidationError("Beta acid content must be between 0 and 30%.")

    @validates("type")
    def validate_type(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Type is required and cannot be empty.")
        if value and value not in self.VALID_TYPES:
            raise ValidationError(f"Type must be one of: {', '.join(self.VALID_TYPES)}.")

    @validates("countryOfOrigin")
    def validate_country_of_origin(self, value, *args, **kwargs):
        if value and len(value) > 50:
            raise ValidationError("Country of origin must be at most 50 characters long.")

    @validates("useType")
    def validate_use_type(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Type is required and cannot be empty.")
        if value and value not in self.VALID_USE_TYPES:
            raise ValidationError(f"Use type must be one of: {', '.join(self.VALID_USE_TYPES)}.")
