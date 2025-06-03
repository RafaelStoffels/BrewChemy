from marshmallow import Schema, fields, validates, ValidationError
from schemas.equipments_schema import EquipmentsSchema
from schemas.fermentables_schema import FermentablesSchema
from schemas.hops_schema import HopsSchema
from schemas.miscs_schema import MiscsSchema
from schemas.yeasts_schema import YeastsSchema
from marshmallow.validate import OneOf


class RecipeSchema(Schema):
    id = fields.Int(dump_only=True)
    userId = fields.Int(required=True)
    name = fields.Str(required=True)
    style = fields.Str()
    description = fields.Str()
    notes = fields.Str()
    author = fields.Str(required=True)
    type = fields.Str(required=True)

    recipeEquipment = fields.Nested(EquipmentsSchema)
    recipeFermentables = fields.Nested(FermentablesSchema, many=True)
    recipeHops = fields.Nested(HopsSchema, many=True)
    recipeMisc = fields.Nested(MiscsSchema, many=True)
    recipeYeasts = fields.Nested(YeastsSchema, many=True)

    @validates("name")
    def validate_name(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Name must not be empty.")
        if len(value) > 40:
            raise ValidationError("Name must be at most 40 characters long.")

    @validates("style")
    def validate_name(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Style must not be empty.")

    @validates("type")
    def validate_type(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Type is required and cannot be empty.")
        if value not in self.VALID_TYPES:
            raise ValidationError(f"Type must be one of: {', '.join(self.VALID_TYPES)}.")
