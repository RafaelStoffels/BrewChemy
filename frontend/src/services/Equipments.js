export async function searchEquipments(api, userToken, term) {
    try {
        const response = await api.get('/api/equipments/search', {
            headers: { Authorization: `Bearer ${userToken}` },
            params: { searchTerm: term }
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error loading equipments');
    }
}

export async function fetchEquipments(api, userToken) {
    try {
        const response = await api.get('api/equipments', {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error loading equipments');
    }
}

export async function fetchEquipmentById(api, userToken, recordUserId, id) {
    try {
        const response = await api.get(`/api/equipments/${recordUserId}/${id}`, {
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

export async function deleteEquipment(api, userToken, recordUserId, id) {
    try {
        const response = await api.delete(`api/equipments/${recordUserId}/${id}`, {
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
        throw new Error('Error deleting equipment');
    }
}

export async function addEquipment(api, userToken, dataInput) {
    try {
        const response = await api.post('/api/equipments', dataInput, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error adding equipment');
    }
}

export async function updateEquipment(api, userToken, recordUserId, id, dataInput) {
    try {
        const response = await api.put(`/api/equipments/${recordUserId}/${id}`, dataInput, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Error updating equipment');
    }
}