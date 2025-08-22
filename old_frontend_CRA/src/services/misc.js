// services/miscs.js
import api from './api';
import { request, withAuth } from '../utils/http';

export function searchMiscs(userToken, term, opts = {}) {
  return request(
    api.get('/api/miscs/search', {
      ...withAuth(userToken),
      params: { searchTerm: term },
    }),
    { fallback: 'Error loading miscs', ...opts },
  );
}

export function fetchMisc(userToken, opts = {}) {
  return request(
    api.get('/api/miscs', withAuth(userToken)),
    { fallback: 'Error loading miscs', ...opts },
  );
}

export function fetchMiscById(userToken, recordUserId, id, opts = {}) {
  return request(
    api.get(`/api/miscs/${recordUserId}/${id}`, withAuth(userToken)),
    { fallback: 'Error loading misc', ...opts },
  );
}

export function deleteMisc(userToken, recordUserId, id, opts = {}) {
  return request(
    api.delete(`/api/miscs/${recordUserId}/${id}`, withAuth(userToken)),
    { fallback: 'Error deleting misc', successMsg: 'Misc deleted successfully.', ...opts },
  );
}

export function addMisc(userToken, dataInput, opts = {}) {
  return request(
    api.post('/api/miscs', dataInput, withAuth(userToken)),
    { fallback: 'Error adding misc', successMsg: 'Misc added successfully.', ...opts },
  );
}

export function updateMisc(userToken, id, dataInput, opts = {}) {
  return request(
    api.put(`/api/miscs/${id}`, dataInput, withAuth(userToken)),
    { fallback: 'Error updating misc', successMsg: 'Misc updated successfully.', ...opts },
  );
}
