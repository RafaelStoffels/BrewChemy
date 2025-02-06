export async function fetchMisc(api, userToken) {
    try {
        const response = await api.get('api/misc', {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
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
        throw new Error('Error deleting misc');
    }
}