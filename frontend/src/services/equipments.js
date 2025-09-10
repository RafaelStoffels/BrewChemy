// services/equipments.js
import api from './api';
import { request, withAuth } from '../utils/http';

export function searchEquipments(userToken, term, opts = {}) {
  return request(
    api.get('/api/equipments/search', {
      ...withAuth(userToken),
      params: { searchTerm: term },
    }),
    { fallback: 'Error loading equipments', ...opts },
  );
}

export function fetchEquipments(userToken, opts = {}) {
  return request(
    api.get('/api/equipments', withAuth(userToken)),
    { fallback: 'Error loading equipments', ...opts },
  );
}

export function fetchEquipmentById(userToken, id, opts = {}) {
  return request(
    api.get(`/api/equipments/${id}`, withAuth(userToken)),
    { fallback: 'Error loading equipment', ...opts },
  );
}

export function addEquipment(userToken, dataInput, opts = {}) {
  return request(
    api.post('/api/equipments', dataInput, withAuth(userToken)),
    { fallback: 'Error adding equipment', successMsg: 'Equipment added successfully.', ...opts },
  );
}

export function updateEquipment(userToken, id, dataInput, opts = {}) {
  return request(
    api.put(`/api/equipments/${id}`, dataInput, withAuth(userToken)),
    { fallback: 'Error updating equipment', successMsg: 'Equipment updated successfully.', ...opts },
  );
}

export function deleteEquipment(userToken, id, opts = {}) {
  return request(
    api.delete(`/api/equipments/${id}`, withAuth(userToken)),
    { fallback: 'Error deleting equipment', successMsg: 'Equipment deleted successfully.', ...opts },
  );
}