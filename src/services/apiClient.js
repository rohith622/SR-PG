
/**
 * Unified API Client for SR PG Management System
 *
 * Features:
 * - Single source of truth for API URL, headers, and authentication tokens
 * - Switchable Mock Service Layer and Real Backend API
 * - Standardized error handling and JSON parsing
 * - Mock network latency simulation
 * - Session-expiry notification for protected API requests
 */


export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const TOKEN_KEY = 'sr_pg_auth_token';
const USER_KEY = 'sr_pg_auth_user';
const LOGIN_ENDPOINT = '/api/auth/login';

const simulateLatency = (ms = 220) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Notify the application when the backend rejects an authenticated session.
 */
function handleSessionExpiry(endpoint, status) {
  const isLoginRequest = endpoint.split('?')[0] === LOGIN_ENDPOINT;

  // Never clear a session because of a failed login attempt.
  if (isLoginRequest) return;

  // A 403 can mean insufficient permissions, not an expired session.
  // Only a 401 is treated as an invalid or expired authentication session.
  if (status !== 401) return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem('sr_pg_demo_authenticated');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sr-pg-session-expired'));
  }
}

/**
 * Standard HTTP Request Wrapper
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    params = null,
    mockHandler = null,
  } = options;

  // 1. MOCK SERVICE LAYER
  if (USE_MOCK && mockHandler) {
    await simulateLatency();

    try {
      const data = await mockHandler(body);

      return {
        data,
        error: null,
        status: 200,
      };
    } catch (err) {
      console.warn(
        `[Mock API ${method} ${endpoint}] Error:`,
        err.message
      );

      return {
        data: null,
        error:
          err.message ||
          'An unexpected error occurred in mock service.',
        status: 400,
      };
    }
  }

  // 2. REAL BACKEND API CALL
  let queryString = '';
  if (params && typeof params === 'object') {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    }
    const qs = searchParams.toString();
    if (qs) {
      queryString = (endpoint.includes('?') ? '&' : '?') + qs;
    }
  }

  const url = `${API_BASE_URL}${endpoint}${queryString}`;
  const authToken = localStorage.getItem(TOKEN_KEY);

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(authToken
      ? { Authorization: `Bearer ${authToken}` }
      : {}),
    ...headers,
  };

  const config = {
    method,
    headers: defaultHeaders,
  };

  if (
    body &&
    ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
  ) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    let responseData = null;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        responseData?.message ||
        responseData?.error ||
        `Request failed with status ${response.status}`;

      handleSessionExpiry(endpoint, response.status);

      return {
        data: null,
        error: errorMessage,
        status: response.status,
      };
    }

    return {
      data: responseData,
      error: null,
      status: response.status,
    };
  } catch (err) {
    console.error(`[API Network Error] ${method} ${url}:`, err);

    return {
      data: null,
      error:
        'Network error or server unreachable. Please verify server connection.',
      status: 0,
    };
  }
}

export default {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'GET',
    }),

  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body,
    }),

  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body,
    }),

  patch: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'DELETE',
    }),
};
