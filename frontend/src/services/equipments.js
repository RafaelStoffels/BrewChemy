import api from './api';
import { showErrorToast, showSuccessToast } from '../utils/notifications';

export async function searchEquipments(userToken, term, { showToast = true } = {}) {
  try {
    const response = await api.get('/api/equipments/search', {
      headers: { Authorization: `Bearer ${userToken}` },
      params: { searchTerm: term },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading equipments';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function fetchEquipments(userToken, { showToast = true } = {}) {
  try {
    const response = await api.get('/api/equipments', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    let msg = 'Error loading equipments';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function fetchEquipmentById(userToken, recordUserId, id, { showToast = true } = {}) {
  try {
    const response = await api.get(`/api/equipments/${recordUserId}/${id}`, {
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

export async function deleteEquipment(userToken, recordUserId, id, { showToast = true } = {}) {
  try {
    const response = await api.delete(`/api/equipments/${recordUserId}/${id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Equipment deleted successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error deleting equipment';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function addEquipment(userToken, dataInput, { showToast = true } = {}) {
  try {
    const response = await api.post('/api/equipments', dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Equipment added successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error adding equipment';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function updateEquipment(userToken, id, dataInput, { showToast = true } = {}) {
  try {
    const response = await api.put(`/api/equipments/${id}`, dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('Equipment updated successfully.');
    return response.data;
  } catch (err) {
    let msg = 'Error updating equipment';
    if (err.response?.status === 401) {
      msg = 'Your session has expired. Please log in again.';
    } else if (err.response?.data?.message || err.response?.data?.error) {
      msg = err.response.data.message || err.response.data.error;
    }
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}
