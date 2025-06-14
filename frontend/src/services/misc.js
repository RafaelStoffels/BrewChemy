import api from './api';
import { showErrorToast, showSuccessToast } from '../utils/notifications';

export async function searchMiscs(userToken, term, { showToast = true } = {}) {
  try {
    const response = await api.get('/api/miscs/search', {
      headers: { Authorization: `Bearer ${userToken}` },
      params: { searchTerm: term },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading miscs';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function fetchMisc(userToken, { showToast = true } = {}) {
  try {
    const response = await api.get('/api/miscs', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading miscs';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function fetchMiscById(userToken, recordUserId, id, { showToast = true } = {}) {
  try {
    const response = await api.get(`/api/miscs/${recordUserId}/${id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading misc';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function deleteMisc(userToken, recordUserId, id, { showToast = true } = {}) {
  try {
    const response = await api.delete(`/api/miscs/${recordUserId}/${id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Misc deleted successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error deleting misc';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function addMisc(userToken, dataInput, { showToast = true } = {}) {
  try {
    const response = await api.post('/api/miscs', dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Misc added successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error adding misc';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function updateMisc(userToken, id, dataInput, { showToast = true } = {}) {
  try {
    const response = await api.put(`/api/miscs/${id}`, dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Misc updated successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error updating misc';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}
