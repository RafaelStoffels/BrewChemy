import api from './api';
import { showErrorToast, showSuccessToast } from '../utils/notifications';

export async function me(userToken, { showToast = true } = {}) {
  try {
    const response = await api.get('/api/users/me', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (err) {
    const msg = 'Failed to fetch user info.';
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function updateUser(userToken, userId, dataInput, { showToast = true } = {}) {
  try {
    const response = await api.put(`/api/users/${userId}`, dataInput, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (showToast) showSuccessToast('User updated successfully.');
    return response.data;
  } catch (err) {
    const msg = err.response?.data?.error || 'Failed to update user.';
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function loginUser(email, password, { login, navigate }) {
  try {
    const response = await api.post('api/login', { email, password });
    const { token } = response.data;

    const userInfo = await me(token);
    const fullUser = { ...userInfo, token };

    login(fullUser);
    navigate('/RecipeList');
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        showErrorToast('Endpoint not found. Please check the URL.');
      } else if (error.response.status === 401) {
        showErrorToast('Invalid credentials. Please check your email or password.');
      } else if (error.response.status === 500) {
        const backendMsg = error.response.data?.error || 'Internal server error.';
        showErrorToast(backendMsg);
      } else {
        showErrorToast('Login failed. Please try again later.');
      }
    } else {
      showErrorToast('Network or server error. Please check your connection and try again.');
    }
    throw error;
  }
}

export async function addUser(data) {
  try {
    await api.post('/api/users', data);
    showSuccessToast(
      'An email with an activation code has been sent. '
      + 'Please check your inbox and activate your account.',
    );
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        showErrorToast(error.response.data.message);
      } else if (error.response.status === 404) {
        showErrorToast('Endpoint not found. Please check the URL.');
      } else if (error.response.status === 401) {
        showErrorToast('Invalid credentials. Please check your email or password.');
      } else if (error.response.status === 500) {
        const backendMsg = error.response.data?.error || 'Internal server error.';
        showErrorToast(backendMsg);
      } else {
        showErrorToast('User creation failed, please try again later.');
      }
    } else {
      showErrorToast('Network or server error. Please check your connection and try again.');
    }
    throw error;
  }
}

export async function sendPasswordResetEmail(data, { showToast = true } = {}) {
  try {
    await api.post('/api/sendPasswordResetEmail', data);
    if (showToast) showSuccessToast('Email sent successfully. Check your inbox for a reset link.');
  } catch (err) {
    const msg = err.response?.data?.details
    || err.response?.data?.error
    || 'Error sending reset email.';
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}

export async function changePassword(data, { showToast = true } = {}) {
  try {
    const response = await api.post('/api/changePassword', data);
    if (showToast) showSuccessToast('Password changed successfully.');
    return response;
  } catch (err) {
    const msg = err.response?.data?.error
      || (err.request ? 'No response from server' : `Request error: ${err.message}`);
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
  }
}
