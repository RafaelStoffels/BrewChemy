export async function searchYeasts(api, userToken, term) {
    try {
        const response = await api.get('/api/yeasts/search', {
            headers: { Authorization: `Bearer ${userToken}` },
            params: { searchTerm: term }
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error loading yeasts');
    }
}

export async function fetchYeasts(api, userToken) {
    try {
        const response = await api.get('api/yeasts', {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error loading yeasts');
    }
}

export async function fetchYeastById(api, userToken, recordUserId, id) {
    try {
        const response = await api.get(`/api/yeasts/${recordUserId}/${id}`, {
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
                throw new Error(`Error loading yeast: ${data.message}`);
            }
        }

        throw new Error('An unexpected error occurred while loading yeast.');
    }
}

export async function deleteYeast(api, userToken, recordUserId, id) {
    try {
        const response = await api.delete(`api/yeasts/${recordUserId}/${id}`, {
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
        throw new Error('Error deleting yeast');
    }
}

export async function addYeast(api, userToken, dataInput) {
    try {
        const response = await api.post('/api/yeasts', dataInput, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error adding yeast');
    }
}

export async function updateYeast(api, userToken, recordUserId, id, dataInput) {
    try {
        const response = await api.put(`/api/yeasts/${recordUserId}/${id}`, dataInput, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error updating yeast');
    }
}