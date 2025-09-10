// services/hops.js
import api from './api';
import { request, withAuth } from '../utils/http';

export function searchHops(userToken, term, opts = {}) {
  return request(
    api.get('/api/hops/search', {
      ...withAuth(userToken),
      params: { searchTerm: term },
    }),
    { fallback: 'Error loading hops', ...opts },
  );
}

export function fetchHops(userToken, opts = {}) {
  return request(
    api.get('/api/hops', withAuth(userToken)),
    { fallback: 'Error loading hops', ...opts },
  );
}

export function fetchHopById(userToken, id, opts = {}) {
  return request(
    api.get(`/api/hops/${id}`, withAuth(userToken)),
    { fallback: 'Error loading hop', ...opts },
  );
}

export function deleteHop(userToken, id, opts = {}) {
  return request(
    api.delete(`/api/hops/${id}`, withAuth(userToken)),
    { fallback: 'Error deleting hop', successMsg: 'Hop deleted successfully.', ...opts },
  );
}

export function addHop(userToken, dataInput, opts = {}) {
  return request(
    api.post('/api/hops', dataInput, withAuth(userToken)),
    { fallback: 'Error adding hop', successMsg: 'Hop added successfully.', ...opts },
  );
}

export function updateHop(userToken, id, dataInput, opts = {}) {
  return request(
    api.put(`/api/hops/${id}`, dataInput, withAuth(userToken)),
    { fallback: 'Error updating hop', successMsg: 'Hop updated successfully.', ...opts },
  );
}
