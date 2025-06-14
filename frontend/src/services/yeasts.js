import api from './api';
import { showErrorToast, showSuccessToast } from '../utils/notifications';

export async function searchYeasts(userToken, term, { showToast = true } = {}) {
  try {
    const response = await api.get('/api/yeasts/search', {
      headers: { Authorization: `Bearer ${userToken}` },
      params: { searchTerm: term },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading yeasts';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function fetchYeasts(userToken, { showToast = true } = {}) {
  try {
    const response = await api.get('/api/yeasts', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading yeasts';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function fetchYeastById(userToken, recordUserId, id, { showToast = true } = {}) {
  try {
    const response = await api.get(`/api/yeasts/${recordUserId}/${id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    let msg = 'An unexpected error occurred while loading yeast.';
    if (err.response) {
      const { status, data } = err.response;
      if (status === 401) {
        msg = 'Your session has expired. Please log in again.';
      } else if (data?.message) {
        msg = `Error loading yeast: ${data.message}`;
      }
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function deleteYeast(userToken, recordUserId, id, { showToast = true } = {}) {
  try {
    const response = await api.delete(`/api/yeasts/${recordUserId}/${id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Yeast deleted successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error deleting yeast';
    if (err.response) {
      const { status, data } = err.response;
      if (status === 401) {
        msg = 'Your session has expired. Please log in again.';
      } else if (data?.message) {
        msg = data.message;
      }
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function addYeast(userToken, dataInput, { showToast = true } = {}) {
  try {
    const response = await api.post('/api/yeasts', dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Yeast added successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error adding yeast';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function updateYeast(userToken, id, dataInput, { showToast = true } = {}) {
  try {
    const response = await api.put(`/api/yeasts/${id}`, dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Yeast updated successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error updating yeast';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}
