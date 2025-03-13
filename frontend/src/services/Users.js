import api from '../services/api';

export async function addUser(data) {
    try {
        await api.post('/api/users', data)
    } catch (err) {
        throw new Error(err);
    }
}
