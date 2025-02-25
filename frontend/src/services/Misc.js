export async function searchMiscs(api, userToken, term) {
    try {
        const response = await api.get('/api/miscs/search', {
            headers: { Authorization: `Bearer ${userToken}` },
            params: { searchTerm: term }
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error loading miscs');
    }
}

export async function fetchMisc(api, userToken) {
    try {
        const response = await api.get('api/misc', {
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

export async function fetchMiscById(api, userToken, miscID) {
    try {
        const response = await api.get(`/api/misc/${miscID}`, {
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

export async function deleteMisc(api, userToken, miscID) {
    try {
        const response = await api.delete(`api/misc/${miscID}`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error deleting misc');
    }
}
