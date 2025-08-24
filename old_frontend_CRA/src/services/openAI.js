import api from './api';
import { showErrorToast } from '../utils/notifications';

async function getOpenAIResponse(recipe, userToken) {
  try {
    let message = `Style: ${recipe.style};`
                + `Liters: ${recipe.recipeEquipment.batchVolume};`
                + `Boil Time: ${recipe.recipeEquipment.boilTime};`;

    message += ' Fermentables: ';
    recipe.recipeFermentables.forEach((fermentable) => {
      message += `${fermentable.name} (${fermentable.quantity}g), `;
    });

    message += ' Hops: ';
    recipe.recipeHops.forEach((hop) => {
      message += `${hop.name} (${hop.quantity}g) (Boil time: ${hop.boilTime}m), `;
    });

    message += ' Miscelaneous: ';
    recipe.recipeMisc.forEach((misc) => {
      message += `${misc.name} (${misc.quantity}g), `;
    });

    message += ' Yeasts: ';
    recipe.recipeYeasts.forEach((yeast) => {
      message += `${yeast.name} (${yeast.quantity}g), `;
    });

    const response = await api.post('api/openAI', { message }, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    return response.data.response;
  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Unexpected error contacting OpenAI.';
    showErrorToast(`OpenAI error: ${msg}`);
    throw new Error(msg);
  }
}

export default getOpenAIResponse;
