export async function fetchFermentables(api, userToken) {
    try {
        const response = await api.get('api/fermentables', {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        throw new Error('Error loading fermentables');
    }
}

export async function fetchFermentableById(api, userToken, fermentableId) {
    try {
        const response = await api.get(`/api/fermentables/${fermentableId}`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        throw new Error('Error loading fermentable');
    }
}

export async function deleteFermentable(api, userToken, fermentableId) {
    try {
        const response = await api.delete(`api/fermentables/${fermentableId}`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        return response.data;
    } catch (err) {
        throw new Error('Error deleting fermentable');
    }
}