from marshmallow import Schema, fields, validates, ValidationError

class EquipmentsSchema(Schema):
    itemUserId = fields.Int(load_only=True)
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str(allow_none=True)

    efficiency = fields.Decimal(required=True, as_string=True)
    batchVolume = fields.Decimal(required=True, as_string=True)
    batchTime = fields.Int(required=True)
    boilTime = fields.Int(required=True)
    boilTemperature = fields.Decimal(required=True, as_string=True)
    boilOff = fields.Decimal(required=True, as_string=True)
    trubLoss = fields.Decimal(required=True, as_string=True)
    deadSpace = fields.Decimal(required=True, as_string=True)

    @validates("name")
    def validate_name(self, value, *args, **kwargs):
        if not value.strip():
            raise ValidationError("Name must not be empty.")
        if len(value) > 50:
            raise ValidationError("Name must be at most 50 characters long.")

    @validates("efficiency")
    def validate_efficiency(self, value, *args, **kwargs):
        if value < 0 or value > 1100:
            raise ValidationError("Efficiency must be between 0 and 1.100.")

    @validates("batchVolume")
    def validate_batch_volume(self, value, *args, **kwargs):
        if value < 0:
            raise ValidationError("Batch volume must be greater than or equal to 0.")

    @validates("batchTime")
    def validate_batch_time(self, value, *args, **kwargs):
        if value < 0:
            raise ValidationError("Batch time must be greater than or equal to 0.")

    @validates("boilTime")
    def validate_boil_time(self, value, *args, **kwargs):
        if value < 0:
            raise ValidationError("Boil time must be greater than or equal to 0.")

    @validates("boilTemperature")
    def validate_boil_temperature(self, value, *args, **kwargs):
        if value < 0 or value > 100:
            raise ValidationError("Boil temperature must be between 0 and 100°C.")

    @validates("boilOff")
    def validate_boil_off(self, value, *args, **kwargs):
        if value < 0:
            raise ValidationError("Boil-off must be greater than or equal to 0.")

    @validates("trubLoss")
    def validate_trub_loss(self, value, *args, **kwargs):
        if value < 0:
            raise ValidationError("Trub loss must be greater than or equal to 0.")

    @validates("deadSpace")
    def validate_dead_space(self, value, *args, **kwargs):
        if value < 0:
            raise ValidationError("Dead space must be greater than or equal to 0.")
