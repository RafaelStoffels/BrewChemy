from marshmallow import Schema, fields, validates, ValidationError

class MiscsSchema(Schema):
    itemUserId = fields.Int(load_only=True)
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    type = fields.Str(required=True)

    VALID_TYPES = {
        "Flavor",
        "Fining",
        "Herb",
        "Spice",
        "Water Agent",
        "Other"
    }

    @validates("name")
    def validate_name(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Name must not be empty.")
        if len(value) > 40:
            raise ValidationError("Name must be at most 40 characters long.")

    @validates("type")
    def validate_type(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Type is required and cannot be empty.")
        if value and value not in self.VALID_TYPES:
            raise ValidationError(f"Type must be one of: {', '.join(self.VALID_TYPES)}.")
