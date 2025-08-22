// services/recipes.js
import api from './api';
import { request, withAuth } from '../utils/http';

export function fetchRecipes(userToken, opts = {}) {
  return request(
    api.get('/api/recipes', withAuth(userToken)),
    { fallback: 'Error loading recipes', ...opts },
  );
}

export function fetchRecipeById(userToken, recipeId, opts = {}) {
  return request(
    api.get(`/api/recipes/${recipeId}`, withAuth(userToken)),
    { fallback: 'Error loading recipe', ...opts },
  );
}

export function deleteRecipe(userToken, itemId, opts = {}) {
  return request(
    api.delete(`/api/recipes/${itemId}`, withAuth(userToken)),
    { fallback: 'Error deleting recipe', successMsg: 'Recipe deleted successfully.', ...opts },
  );
}

export function searchRecipes(userToken, term, opts = {}) {
  return request(
    api.get('/api/recipes/search', {
      ...withAuth(userToken),
      params: { searchTerm: term },
    }),
    { fallback: 'Error searching recipes', ...opts },
  );
}

export function addRecipe(userToken, dataInput, opts = {}) {
  console.log(dataInput);
  return request(
    api.post('/api/recipes', dataInput, withAuth(userToken)),
    { fallback: 'Error saving recipe', successMsg: 'Recipe saved successfully.', ...opts },
  );
}

export function updateRecipe(userToken, id, dataInput, opts = {}) {
  return request(
    api.put(`/api/recipes/${id}`, dataInput, withAuth(userToken)),
    { fallback: 'Error updating recipe', successMsg: 'Recipe saved successfully.', ...opts },
  );
}
