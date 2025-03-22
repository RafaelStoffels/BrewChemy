export async function searchFermentables(api, userToken, term) {
    try {
        const response = await api.get('/api/fermentables/search', {
            headers: { Authorization: `Bearer ${userToken}` },
            params: { searchTerm: term }
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error loading fermentables');
    }
}

export async function fetchFermentables(api, userToken) {
    try {
        const response = await api.get('api/fermentables', {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error loading fermentables');
    }
}

export async function fetchFermentableById(api, userToken, recordUserId, id) {
    try {
        const response = await api.get(`/api/fermentables/${recordUserId}/${id}`, {
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

export async function deleteFermentable(api, userToken, recordUserId, id) {
    try {
        const response = await api.delete(`api/fermentables/${recordUserId}/${id}`, {
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
        throw new Error('Error deleting fermentable');
    }
}

export async function addFermentable(api, userToken, dataInput) {
    try {
        const response = await api.post('/api/fermentables', dataInput, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error adding fermentable');
    }
}

export async function updateFermentable(api, userToken, recordUserId, id, dataInput) {
    try {
        const response = await api.put(`/api/fermentables/${recordUserId}/${id}`, dataInput, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error updating fermentable');
    }
}