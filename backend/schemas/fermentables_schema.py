from marshmallow import Schema, fields, validates, ValidationError

class FermentablesSchema(Schema):
    itemUserId = fields.Int(load_only=True)
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    ebc = fields.Decimal(required=True, as_string=True)
    potentialExtract = fields.Decimal(required=True, as_string=True)
    type = fields.Str(required=True)
    supplier = fields.Str(required=True)
    unitPrice = fields.Decimal(allow_none=True, as_string=True)

    @validates("name")
    def validate_name(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Name must not be empty.")
        if len(value) > 40:
            raise ValidationError("Name must be at most 40 characters long.")

    @validates("ebc")
    def validate_ebc(self, value, *args, **kwargs):
        if value < 0:
            raise ValidationError("EBC must be a positive number.")

    @validates("potentialExtract")
    def validate_potential_extract(self, value, *args, **kwargs):
        if value < 0 or value > 2.000:
            raise ValidationError("Potential extract must be between 0 and 2.000.")

    @validates("type")
    def validate_type(self, value, *args, **kwargs):
        if value.strip() not in ['Base', 'Specialty', 'Adjunct']:
            raise ValidationError("Invalid type. Must be one of: Base, Specialty or Adjunct.")

    @validates("supplier")
    def validate_supplier(self, value, *args, **kwargs):
        if len(value) > 40:
            raise ValidationError("Supplier name must be at most 40 characters long.")

    @validates("unitPrice")
    def validate_unit_price(self, value, *args, **kwargs):
        if value is not None and value < 0:
            raise ValidationError("Unit price must be greater than or equal to 0.")
