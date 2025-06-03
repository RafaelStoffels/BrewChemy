import api from './api';

export async function searchMiscs(userToken, term) {
  try {
    const response = await api.get('/api/miscs/search', {
      headers: { Authorization: `Bearer ${userToken}` },
      params: { searchTerm: term },
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    throw new Error('Error loading miscs');
  }
}

export async function fetchMisc(userToken) {
  try {
    const response = await api.get('api/miscs', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    throw new Error('Error loading misc');
  }
}

export async function fetchMiscById(userToken, recordUserId, id) {
  try {
    const response = await api.get(`/api/miscs/${recordUserId}/${id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;

      if (status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }

      if (data && data.message) {
        throw new Error(`Error loading equipment: ${data.message}`);
      }
    }

    throw new Error('An unexpected error occurred while loading equipment.');
  }
}

export async function deleteMisc(userToken, recordUserId, id) {
  try {
    const response = await api.delete(`api/miscs/${recordUserId}/${id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;

      if (status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }

      if (data && data.message) {
        throw new Error(`${data.message}`);
      }
    }
    throw new Error('Error deleting misc');
  }
}

export async function addMisc(userToken, dataInput) {
  try {
    const response = await api.post('/api/miscs', dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    throw new Error('Error adding misc');
  }
}

export async function updateMisc(userToken, id, dataInput) {
  try {
    const response = await api.put(`/api/miscs/${id}`, dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    throw new Error('Error updating misc');
  }
}
