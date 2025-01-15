export async function fetchMalts(api, userToken) {
    try {
        const response = await api.get('api/malts', {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        alert('Error loading malts records.');
        return [];
    }
}

export async function fetchMaltById(api, userToken, maltId) {
    try {
        const response = await api.get(`/api/malts/${maltId}`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        alert('Error loading malt by id.');
    }
}
