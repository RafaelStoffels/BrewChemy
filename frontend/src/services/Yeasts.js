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

export async function fetchYeastById(api, userToken, yeastID) {
    try {
        const response = await api.get(`/api/yeasts/${yeastID}`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error loading yeast');
    }
}

export async function deleteYeast(api, userToken, yeastID) {
    try {
        const response = await api.delete(`api/yeasts/${yeastID}`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error deleting yeast');
    }
}
