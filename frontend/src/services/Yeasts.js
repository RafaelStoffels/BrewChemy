export async function fetchYeasts(api, userToken) {
    try {
        const response = await api.get('api/yeasts', {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
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
        throw new Error('Error deleting yeast');
    }
}