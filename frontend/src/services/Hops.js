export async function searchHops(api, userToken, term) {
    try {
        const response = await api.get('/api/hops/search', {
            headers: { Authorization: `Bearer ${userToken}` },
            params: { searchTerm: term } // Para passar o parâmetro searchTerm na URL
        });
        return response.data;
    } catch (err) {
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
        throw new Error('Error loading hops');
    }
}

export async function fetchHopById(api, userToken, hopId) {
    try {
        const response = await api.get(`/api/hops/${hopId}`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        throw new Error('Error loading hop');
    }
}

export async function deleteHop(api, userToken, hopId) {
    try {
        const response = await api.delete(`api/hops/${hopId}`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        return response.data;
    } catch (err) {
        throw new Error('Error deleting hops');
    }
}