// services/users.js
import api from './api';
import { request, withAuth } from '../utils/http';

export function me(userToken, opts = {}) {
  return request(
    api.get('/api/users/me', withAuth(userToken)),
    { fallback: 'Failed to fetch user info.', ...opts },
  );
}

export function updateUser(userToken, userId, dataInput, opts = {}) {
  return request(
    api.put(`/api/users/${userId}`, dataInput, withAuth(userToken)),
    { fallback: 'Failed to update user.', successMsg: 'User updated successfully.', ...opts },
  );
}

export function loginUser(email, password, { login, navigate, ...opts }) {
  return request(
    api.post('api/login', { email, password }),
    {
      fallback: 'Login failed. Please try again later.',
      onSuccess: async (response) => {
        const { token } = response.data;
        const userInfo = await me(token);
        const fullUser = { ...userInfo, token };
        login(fullUser);
        navigate('/RecipeList');
      },
      ...opts,
    },
  );
}

export function addUser(data, opts = {}) {
  return request(
    api.post('/api/users', data),
    {
      fallback: 'User creation failed, please try again later.',
      successMsg:
        'An email with an activation code has been sent. Please check your inbox and activate your account.',
      ...opts,
    },
  );
}

export function sendPasswordResetEmail(data, opts = {}) {
  return request(
    api.post('/api/sendPasswordResetEmail', data),
    {
      fallback: 'Error sending reset email.',
      successMsg: 'Email sent successfully. Check your inbox for a reset link.',
      ...opts,
    },
  );
}

export function changePassword(data, opts = {}) {
  return request(
    api.post('/api/changePassword', data),
    {
      fallback: 'Error changing password.',
      successMsg: 'Password changed successfully.',
      ...opts,
    },
  );
}
