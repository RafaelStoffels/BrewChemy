from marshmallow import Schema, fields, validates, ValidationError, EXCLUDE
from marshmallow.validate import OneOf

class UserSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    user_id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(load_only=True)
    created_at = fields.DateTime(dump_only=True)
    last_login = fields.DateTime(dump_only=True)
    is_active = fields.Bool()
    brewery = fields.Str()
    google_id = fields.Str()
    status = fields.Str()
    weightUnit = fields.Str(validate=OneOf(["oz", "g"]), missing="g")
