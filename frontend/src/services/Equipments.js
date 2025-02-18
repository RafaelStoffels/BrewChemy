export async function searchEquipments(api, userToken, term) {
    try {
        const response = await api.get('/api/equipments/search', {
            headers: { Authorization: `Bearer ${userToken}` },
            params: { searchTerm: term }
        });
        return response.data;
    } catch (err) {
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
        throw new Error('Error loading equipments');
    }
}

export async function fetchEquipmentById(api, userToken, equipmentId) {
    try {
        const response = await api.get(`/api/equipments/${equipmentId}`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        return response.data;
    } catch (err) {
        throw new Error('Error loading equipment');
    }
}

export async function deleteEquipment(api, userToken, equipmentId) {
    try {
        const response = await api.delete(`api/equipments/${equipmentId}`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        return response.data;
    } catch (err) {
        throw new Error('Error deleting equipment');
    }
}