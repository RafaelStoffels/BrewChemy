// services/fermentables.js
import api from './api';
import { request, withAuth } from '../utils/http';

export function searchFermentables(userToken, term, opts = {}) {
  return request(
    api.get('/api/fermentables/search', {
      ...withAuth(userToken),
      params: { searchTerm: term },
    }),
    { fallback: 'Error searching fermentables', ...opts },
  );
}

export function fetchFermentables(userToken, opts = {}) {
  return request(
    api.get('/api/fermentables', withAuth(userToken)),
    { fallback: 'Error loading fermentables', ...opts },
  );
}

export function fetchFermentableById(userToken, id, opts = {}) {
  return request(
    api.get(`/api/fermentables/${id}`, withAuth(userToken)),
    { fallback: 'Error loading fermentable', ...opts },
  );
}

export function deleteFermentable(userToken, id, opts = {}) {
  return request(
    api.delete(`/api/fermentables/${id}`, withAuth(userToken)),
    { fallback: 'Error deleting fermentable', successMsg: 'Fermentable deleted successfully.', ...opts },
  );
}

export function addFermentable(userToken, dataInput, opts = {}) {
  return request(
    api.post('/api/fermentables', dataInput, withAuth(userToken)),
    { fallback: 'Error adding fermentable', successMsg: 'Fermentable added successfully.', ...opts },
  );
}

export function updateFermentable(userToken, id, dataInput, opts = {}) {
  return request(
    api.put(`/api/fermentables/${id}`, dataInput, withAuth(userToken)),
    { fallback: 'Error updating fermentable', successMsg: 'Fermentable updated successfully.', ...opts },
  );
}
