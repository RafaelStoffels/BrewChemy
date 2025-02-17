from flask import Blueprint, request, jsonify
from db import db
from AuthTokenVerifier import token_required
from models import Recipe, RecipeEquipment, RecipeFermentable, RecipeHop, RecipeMisc, RecipeYeast

def create_copy_recipe_bp():
    copy_recipe_bp = Blueprint("copy_recipe", __name__)

    @copy_recipe_bp.route("/recipes/copy", methods=["POST"])
    @token_required
    def copy_recipe(current_user_id):
        data = request.get_json()

        id_receita = data.get("idReceita")
        id_usuario_destino = data.get("idUsuarioDestino")

        if not id_receita or not id_usuario_destino:
            return jsonify({"error": "Os campos 'idReceita' e 'idUsuarioDestino' são obrigatórios."}), 400

        print(current_user_id)

        # Busca a receita original
        receita_original = Recipe.query.filter_by(id=id_receita, user_id=current_user_id).first()

        if not receita_original:
            return jsonify({"error": "Receita não encontrada ou não pertence ao usuário autenticado."}), 404

        # Cria uma nova receita
        nova_receita = Recipe(
            user_id=id_usuario_destino,
            name=f"{receita_original.name} (Cópia)",
            style=receita_original.style,
            description=receita_original.description,
            volume_liters=receita_original.volume_liters,
            notes=receita_original.notes,
            author=receita_original.author,
            type=receita_original.type,
            equipment_id=receita_original.equipment_id
        )

        db.session.add(nova_receita)
        db.session.flush()  # Garante que o ID da nova receita é gerado antes de copiar os ingredientes

        # Copia os fermentáveis
        for fermentable in receita_original.recipe_fermentables:
            novo_fermentable = RecipeFermentable(
                user_id=id_usuario_destino,
                recipe_id=nova_receita.id,
                name=fermentable.name,
                description=fermentable.description,
                ebc=fermentable.ebc,
                potential_extract=fermentable.potential_extract,
                malt_type=fermentable.malt_type,
                supplier=fermentable.supplier,
                unit_price=fermentable.unit_price,
                notes=fermentable.notes,
                quantity=fermentable.quantity
            )
            db.session.add(novo_fermentable)

        # Copia os lúpulos
        for hop in receita_original.recipe_hops:
            novo_hop = RecipeHop(
                user_id=id_usuario_destino,
                recipe_id=nova_receita.id,
                name=hop.name,
                alpha_acid_content=hop.alpha_acid_content,
                beta_acid_content=hop.beta_acid_content,
                use_type=hop.use_type,
                country_of_origin=hop.country_of_origin,
                description=hop.description,
                quantity=hop.quantity,
                boil_time=hop.boil_time
            )
            db.session.add(novo_hop)

        # Copia os adjuntos
        for misc in receita_original.recipe_misc:
            novo_misc = RecipeMisc(
                user_id=id_usuario_destino,
                recipe_id=nova_receita.id,
                name=misc.name,
                description=misc.description,
                type=misc.type,
                quantity=misc.quantity,
                use=misc.use,
                time=misc.time
            )
            db.session.add(novo_misc)

        # Copia as leveduras
        for yeast in receita_original.recipe_yeasts:
            novo_yeast = RecipeYeast(
                user_id=id_usuario_destino,
                recipe_id=nova_receita.id,
                name=yeast.name,
                manufacturer=yeast.manufacturer,
                type=yeast.type,
                form=yeast.form,
                attenuation=yeast.attenuation,
                temperature_range=yeast.temperature_range,
                alcohol_tolerance=yeast.alcohol_tolerance,
                flavor_profile=yeast.flavor_profile,
                flocculation=yeast.flocculation,
                description=yeast.description,
                quantity=yeast.quantity
            )
            db.session.add(novo_yeast)

        # Copia o equipamento, se existir
        if receita_original.recipe_equipment:
            equipamento_original = receita_original.recipe_equipment[0]  # Assumindo que há no máximo um equipamento
            novo_equipamento = RecipeEquipment(
                user_id=id_usuario_destino,
                recipe_id=nova_receita.id,
                name=equipamento_original.name,
                description=equipamento_original.description,
                efficiency=equipamento_original.efficiency,
                batch_volume=equipamento_original.batch_volume,
                boil_time=equipamento_original.boil_time,
                boil_temperature=equipamento_original.boil_temperature,
                batch_time=equipamento_original.batch_time,
                boil_off=equipamento_original.boil_off,
                dead_space=equipamento_original.dead_space,
                trub_loss=equipamento_original.trub_loss
            )
            db.session.add(novo_equipamento)

        db.session.commit()

        return jsonify({"message": "Receita copiada com sucesso!", "novaReceitaId": nova_receita.id}), 201

    return copy_recipe_bp
