// services/http.js
import { showErrorToast, showSuccessToast } from './notifications';

export function extractApiError(err, fallback = 'Unexpected error') {
  const status = err?.response?.status;
  let message = fallback;

  if (status === 401) {
    message = 'Your session has expired. Please log in again.';
  } else if (err?.response?.data?.message || err?.response?.data?.error) {
    message = err.response.data.message || err.response.data.error;
  } else if (err?.message) {
    message = err.message;
  }

  return { message, status };
}

export async function request(promise, { showToast = true, successMsg, fallback } = {}) {
  try {
    const response = await promise;
    if (successMsg) showSuccessToast(successMsg);
    return response.data;
  } catch (err) {
    const { message, status } = extractApiError(err, fallback);
    if (showToast) showErrorToast(message);

    throw Object.assign(new Error(message), { status, cause: err });
  }
}

export const withAuth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});
