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

export async function addUser(data, { showToast = true } = {}) {
  try {
    await api.post('/api/users', data);
    if (showToast) showSuccessToast('User created successfully.');
  } catch (err) {
    const msg = err.response?.data?.error || 'Error creating user.';
    if (showToast) showErrorToast(msg);
    throw new Error(msg);
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
