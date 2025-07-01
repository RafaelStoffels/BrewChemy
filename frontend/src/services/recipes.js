import api from './api';
import { showErrorToast, showSuccessToast } from '../utils/notifications';

export async function fetchRecipes(userToken, { showToast = true } = {}) {
  try {
    const response = await api.get('/api/recipes', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading equipment';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function fetchRecipeById(userToken, recipeId, { showToast = true } = {}) {
  try {
    const response = await api.get(`/api/recipes/${recipeId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading equipment';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function deleteRecipe(userToken, itemId, { showToast = true } = {}) {
  try {
    await api.delete(`/api/recipes/${itemId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Recipe deleted successfully.');
  } catch (err) {
    let msg = 'Error loading equipment';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function searchRecipes(userToken, term, { showToast = true } = {}) {
  try {
    const response = await api.get('/api/recipes/search', {
      headers: { Authorization: `Bearer ${userToken}` },
      params: { searchTerm: term },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading equipment';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function addRecipe(userToken, dataInput, { showToast = true } = {}) {
  try {
    console.log(dataInput);
    const response = await api.post('/api/recipes', dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Recipe saved successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error loading equipment';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function updateRecipe(userToken, id, dataInput, { showToast = true } = {}) {
  try {
    const response = await api.put(`/api/recipes/${id}`, dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Recipe saved successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error loading equipment';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}
