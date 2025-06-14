import api from './api';
import { showErrorToast, showSuccessToast } from '../utils/notifications';

export async function searchHops(userToken, term, { showToast = true } = {}) {
  try {
    const response = await api.get('/api/hops/search', {
      headers: { Authorization: `Bearer ${userToken}` },
      params: { searchTerm: term },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading hops';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function fetchHops(userToken, { showToast = true } = {}) {
  try {
    const response = await api.get('/api/hops', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading hops';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function fetchHopById(userToken, recordUserId, id, { showToast = true } = {}) {
  try {
    const response = await api.get(`/api/hops/${recordUserId}/${id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading hop';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function deleteHop(userToken, recordUserId, id, { showToast = true } = {}) {
  try {
    const response = await api.delete(`/api/hops/${recordUserId}/${id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Hop deleted successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error deleting hop';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function addHop(userToken, dataInput, { showToast = true } = {}) {
  try {
    const response = await api.post('/api/hops', dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Hop added successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error adding hop';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function updateHop(userToken, id, dataInput, { showToast = true } = {}) {
  try {
    const response = await api.put(`/api/hops/${id}`, dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Hop updated successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error updating hop';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}
