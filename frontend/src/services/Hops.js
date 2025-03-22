export async function searchHops(api, userToken, term) {
    try {
        const response = await api.get('/api/hops/search', {
            headers: { Authorization: `Bearer ${userToken}` },
            params: { searchTerm: term }
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error loading hops');
    }
}

export async function fetchHops(api, userToken) {
    try {
        const response = await api.get('api/hops', {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error loading hops');
    }
}

export async function fetchHopById(api, userToken, recordUserId, id) {
    try {
        const response = await api.get(`/api/hops/${recordUserId}/${id}`, {
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

export async function deleteHop(api, userToken, recordUserId, id) {
    try {
        const response = await api.delete(`api/hops/${recordUserId}/${id}`, {
            headers: { Authorization: `Bearer ${userToken}` }
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
        throw new Error('Error deleting hop');
    }
}

export async function addHop(api, userToken, dataInput) {
    try {
        const response = await api.post('/api/hops', dataInput, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error adding hop');
    }
}

export async function updateHop(api, userToken, recordUserId, id, dataInput) {
    try {
        const response = await api.put(`/api/hops/${recordUserId}/${id}`, dataInput, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error updating hop');
    }
}