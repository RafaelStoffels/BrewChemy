// services/openAI.js
import api from './api';
import { request, withAuth } from '../utils/http';

export function buildOpenAIMessage(recipe) {
  if (!recipe) return '';

  const parts = [
    `Style: ${recipe.style};`,
    `Liters: ${recipe?.recipeEquipment?.batchVolume};`,
    `Boil Time: ${recipe?.recipeEquipment?.boilTime};`,
  ];

  const fmt = (arr, label) => {
    if (!Array.isArray(arr) || arr.length === 0) return;
    const s = arr
      .map((item) => {
        if (label === 'Hops') {
          return `${item.name} (${item.quantity}g) (Boil time: ${item.boilTime}m)`;
        }
        return `${item.name} (${item.quantity}g)`;
      })
      .join(', ');
    parts.push(` ${label}: ${s}.`);
  };

  fmt(recipe.recipeFermentables, 'Fermentables');
  fmt(recipe.recipeHops, 'Hops');
  fmt(recipe.recipeMisc, 'Miscelaneous');
  fmt(recipe.recipeYeasts, 'Yeasts');

  return parts.join('');
}

export function getOpenAIResponse(userToken, recipe, opts = {}) {
  const message = buildOpenAIMessage(recipe);

  return request(
    api.post('/api/openAI', { message }, withAuth(userToken)),
    { fallback: 'Could not get AI suggestion right now.', ...opts },
  ).then((data) => data?.message ?? data?.response ?? data);
}

export default getOpenAIResponse;
