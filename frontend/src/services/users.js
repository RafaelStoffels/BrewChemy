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

export async function loginUser(email, password, { login, navigate, ...opts }) {
  console.log('inicio');
  try {
    // request() retorna response.data
    const data = await request(
      api.post('/api/users/login', { email, password }),
      { showToast: false, ...opts },
    );
    console.log('[loginUser] data de /login:', data);

    const token = data?.token ?? data?.access_token;
    if (!token) throw new Error('Token ausente na resposta de /login');

    console.log('[loginUser] chamando me()…');
    const userInfo = await me(token, { showToast: false });
    console.log('[loginUser] me() OK:', userInfo);

    const fullUser = { ...userInfo, token };
    console.log('[loginUser] chamando login(fullUser)…');
    login(fullUser);

    console.log('[loginUser] chamando navigate…');
    navigate('/RecipeList', { replace: true });

    console.log('[loginUser] fim');
  } catch (err) {
    console.error('[loginUser] erro:', err);
    // se quiser, toast aqui
  }
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
    api.post('/api/users/sendPasswordResetEmail', data),
    {
      fallback: 'Error sending reset email.',
      successMsg: 'Email sent successfully. Check your inbox for a reset link.',
      ...opts,
    },
  );
}

export function changePassword(data, opts = {}) {
  return request(
    api.post('/api/users/changePassword', data),
    {
      fallback: 'Error changing password.',
      successMsg: 'Password changed successfully.',
      ...opts,
    },
  );
}
