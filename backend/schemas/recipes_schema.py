from marshmallow import Schema, fields, validates, ValidationError, EXCLUDE
from schemas.equipments_schema import EquipmentsSchema
from schemas.fermentables_schema import FermentablesSchema
from schemas.recipe_hops_schema import RecipeHopSchema
from schemas.miscs_schema import MiscsSchema
from schemas.yeasts_schema import YeastsSchema
from marshmallow.validate import OneOf


class RecipeSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    name = fields.Str(required=True)
    style = fields.Str()
    description = fields.Str()
    notes = fields.Str()
    author = fields.Str(required=True)
    type = fields.Str(required=True)

    recipeEquipment = fields.Nested(EquipmentsSchema)
    recipeFermentables = fields.Nested(FermentablesSchema, many=True)
    recipeHops = fields.Nested(RecipeHopSchema, many=True)
    recipeMisc = fields.Nested(MiscsSchema, many=True)
    recipeYeasts = fields.Nested(YeastsSchema, many=True)

    VALID_TYPES = {
        "All Grain",
        "Extract",
        "Partial Mash"
    }

    VALID_USAGE_STAGE = {
        "Boil",
        "Dry Hop",
        "Whirlpool",
        "Mash",
        "First Wort"
    }

    @validates("name")
    def validate_name(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Name must not be empty.")
        if len(value) > 40:
            raise ValidationError("Name must be at most 40 characters long.")

    @validates("style")
    def validate_style(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Style must not be empty.")

    @validates("type")
    def validate_type(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Type is required and cannot be empty.")
        if value not in self.VALID_TYPES:
            raise ValidationError(f"Type must be one of: {', '.join(self.VALID_TYPES)}.")

    @validates("usageStage")
    def validate_type(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Usage stage is required and cannot be empty.")
        if value not in self.VALID_TYPES:
            raise ValidationError(f"Usage stage must be one of: {', '.join(self.VALID_TYPES)}.")