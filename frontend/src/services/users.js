import api from './api';

export async function me(userToken) {
  try {
    const response = await api.get('/api/users/me', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
}

export async function addUser(data) {
  try {
    await api.post('/api/users', data);
  } catch (err) {
    throw new Error(err);
  }
}

export async function sendPasswordResetEmail(data) {
  try {
    await api.post('/api/sendPasswordResetEmail', data);
  } catch (err) {
    throw new Error(err);
  }
}

export async function changePassword(data) {
  try {
    const response = await api.post('/api/changePassword', data);
    return response;
  } catch (err) {
    if (err.response) {
      throw new Error(`${err.response.data.error || 'Unknown error'}`);
    } else if (err.request) {
      throw new Error('No response from server');
    } else {
      throw new Error(`Request error: ${err.message}`);
    }
  }
}
