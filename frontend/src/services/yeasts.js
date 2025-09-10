// services/yeasts.js
import api from './api';
import { request, withAuth } from '../utils/http';

export function searchYeasts(userToken, term, opts = {}) {
  return request(
    api.get('/api/yeasts/search', {
      ...withAuth(userToken),
      params: { searchTerm: term },
    }),
    { fallback: 'Error loading yeasts', ...opts },
  );
}

export function fetchYeasts(userToken, opts = {}) {
  return request(
    api.get('/api/yeasts', withAuth(userToken)),
    { fallback: 'Error loading yeasts', ...opts },
  );
}

export function fetchYeastById(userToken, id, opts = {}) {
  return request(
    api.get(`/api/yeasts/${id}`, withAuth(userToken)),
    { fallback: 'Error loading yeast', ...opts },
  );
}

export function deleteYeast(userToken, id, opts = {}) {
  return request(
    api.delete(`/api/yeasts/${id}`, withAuth(userToken)),
    { fallback: 'Error deleting yeast', successMsg: 'Yeast deleted successfully.', ...opts },
  );
}

export function addYeast(userToken, dataInput, opts = {}) {
  return request(
    api.post('/api/yeasts', dataInput, withAuth(userToken)),
    { fallback: 'Error adding yeast', successMsg: 'Yeast added successfully.', ...opts },
  );
}

export function updateYeast(userToken, id, dataInput, opts = {}) {
  return request(
    api.put(`/api/yeasts/${id}`, dataInput, withAuth(userToken)),
    { fallback: 'Error updating yeast', successMsg: 'Yeast updated successfully.', ...opts },
  );
}
