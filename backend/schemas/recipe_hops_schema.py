from schemas.hops_schema import HopsSchema
from marshmallow import fields, validates, ValidationError

class RecipeHopSchema(HopsSchema):
    quantity = fields.Float(required=True)
    alphaAcid = fields.Float()
    boilTime = fields.Int()
    usageStage = fields.Str(required=True)
    useType = fields.Str(required=False)

    VALID_USAGE_STAGE = {
        "Boil",
        "Dry Hop",
        "Whirlpool",
        "Mash",
        "First Wort"
    }

    @validates("usageStage")
    def validate_usage_stage(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Usage stage is required and cannot be empty.")
        if value not in self.VALID_USAGE_STAGE:
            raise ValidationError(f"Usage stage must be one of: {', '.join(self.VALID_USAGE_STAGE)}.")

    @validates("useType")
    def skip_validation(self, value, *args, **kwargs):
        pass  # Ignora validação
    