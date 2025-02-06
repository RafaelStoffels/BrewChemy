import api from './api';

export async function getOpenAIResponse(recipe, userToken) {
    try {
        let message = "Estilo: "   + recipe.style                       + ";"
                    + "Litragem: " + recipe.recipeEquipment.batchVolume + ";";

        message += " Fermentaveis: ";

        recipe.recipeFermentables.forEach((fermentable) => {
            message += fermentable.name + " (" + fermentable.quantity + "g),";
        });

        message += " Lupulos: ";

        recipe.recipeHops.forEach((hop) => {
            message += hop.name + " (" + hop.quantity + "g),";
        });

        message += " Condimentos: ";

        recipe.recipeMisc.forEach((misc) => {
            message += misc.name + " (" + misc.quantity + "g),";
        });

        message += " Leveduras: ";

        recipe.recipeYeasts.forEach((yeast) => {
            message += yeast.name + " (" + yeast.quantity + "g),";
        });

        const response = await api.post('api/openAI', { message }, {
            headers: { Authorization: `Bearer ${userToken}` },
        });

        return response.data.response;
    } catch (err) {
        console.error("Erro na API:", err.response ? err.response.data : err.message);
        throw new Error('Error openAI.');
    }
}