// services/http.js
import { showErrorToast, showSuccessToast } from './notifications';

export function extractApiError(err, fallback = 'Unexpected error') {
  const status = err?.response?.status;
  const data = err?.response?.data;
  let message;

  if (status === 401) {
    message = 'Your session has expired. Please log in again.';
  } else if (data) {
    if (typeof data.detail === 'string') {
      message = data.detail;
    } else if (Array.isArray(data.detail)) {
      message = data.detail
        .map((e) => e?.msg || (typeof e === 'string' ? e : ''))
        .filter(Boolean)
        .join('\n');
    } else if (data.message || data.error) {
      message = data.message || data.error;
    }
  }

  if (!message) {
    message = err?.message || fallback;
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
