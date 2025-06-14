import api from './api';
import { showErrorToast, showSuccessToast } from '../utils/notifications';

export async function searchFermentables(userToken, term, { showToast = true } = {}) {
  try {
    const response = await api.get('/api/fermentables/search', {
      headers: { Authorization: `Bearer ${userToken}` },
      params: { searchTerm: term },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading fermentables';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function fetchFermentables(userToken, { showToast = true } = {}) {
  try {
    const response = await api.get('/api/fermentables', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading fermentables';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function fetchFermentableById(userToken, recordUserId, id, { showToast = true } = {}) {
  try {
    const response = await api.get(`/api/fermentables/${recordUserId}/${id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading fermentable';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function deleteFermentable(userToken, recordUserId, id, { showToast = true } = {}) {
  try {
    const response = await api.delete(`/api/fermentables/${recordUserId}/${id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Fermentable deleted successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error deleting fermentable';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function addFermentable(userToken, dataInput, { showToast = true } = {}) {
  try {
    const response = await api.post('/api/fermentables', dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Fermentable added successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error adding fermentable';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function updateFermentable(userToken, id, dataInput, { showToast = true } = {}) {
  try {
    const response = await api.put(`/api/fermentables/${id}`, dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Fermentable updated successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error updating fermentable';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}
