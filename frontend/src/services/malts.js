export async function fetchMalts(api, userToken) {
    try {
        const response = await api.get('api/malts', {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        throw new Error('Error loading malts');
    }
}

export async function fetchMaltById(api, userToken, maltId) {
    try {
        const response = await api.get(`/api/malts/${maltId}`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        throw new Error('Error loading malt');
    }
}

export async function deleteMalt(api, userToken, maltId) {
    try {
        const response = await api.delete(`api/malts/${maltId}`, {
            headers: { Authorization: `Bearer ${userToken}` }
          });
        return response.data;
    } catch (err) {
        throw new Error('Error deleting malt');
    }
}
