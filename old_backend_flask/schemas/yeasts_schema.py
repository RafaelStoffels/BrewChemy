from marshmallow import Schema, fields, validates, ValidationError, EXCLUDE
from marshmallow.validate import OneOf

class YeastsSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    itemUserId = fields.Int(load_only=True)
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    manufacturer = fields.Str(allow_none=True)
    type = fields.Str(required=True,)
    form = fields.Str(allow_none=True)
    attenuation = fields.Decimal(as_string=True, allow_none=True)
    flavorProfile = fields.Str(allow_none=True)
    flocculation = fields.Str(allow_none=True)
    description = fields.Str(allow_none=True)
    quantity = fields.Float(required=False)

    VALID_TYPES = {"Ale", "Lager", "Wine", "Champagne", "Brett", "Wild", "Other"}
    VALID_FORMS = {"Liquid", "Dry", "Slant", "Culture", "Other"}

    @validates("name")
    def validate_name(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Name must not be empty.")
        if len(value) > 40:
            raise ValidationError("Name must be at most 40 characters long.")

    @validates("type")
    def validate_type_not_empty(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Type is required and cannot be empty.")
        if value and value not in self.VALID_TYPES:
            raise ValidationError(f"Type must be one of: {', '.join(self.VALID_TYPES)}.")
        
    @validates("form")
    def validate_form_not_empty(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Form is required and cannot be empty.")
        if value and value not in self.VALID_FORMS:
            raise ValidationError(f"Type must be one of: {', '.join(self.VALID_FORMS)}.")

    @validates("attenuation")
    def validate_type_not_empty(self, value, *args, **kwargs):
        if value <= 0:
            raise ValidationError("Attenuation is required and cannot be zero.")
