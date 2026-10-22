/**
 * Unified API Client for SR PG Management System
 * 
 * Features:
 * - Single source of truth for Base URL, headers, and authentication tokens
 * - Switchable between Mock Service Layer (current frontend demo) and Real Backend API
 * - Standardized error handling and JSON parsing
 * - Realistic network latency simulation for mock mode to verify UI spinners & loaders
 * 
 * When connecting to your real backend:
 * 1. Set VITE_API_BASE_URL in your .env file (e.g. VITE_API_BASE_URL=http://localhost:5000)
 * 2. Set USE_MOCK = false below or set VITE_USE_MOCK=false in your .env
 */

import { storage } from './storageService';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'; // defaults to true for pure frontend mode

// Simulated delay helper for realistic loading indicators in mock mode
const simulateLatency = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Standard HTTP Request Wrapper
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    mockHandler = null,
  } = options;

  // 1. MOCK SERVICE LAYER
  if (USE_MOCK && mockHandler) {
    await simulateLatency();
    try {
      const data = await mockHandler(body);
      return { data, error: null, status: 200 };
    } catch (err) {
      console.warn(`[Mock API ${method} ${endpoint}] Error:`, err.message);
      return {
        data: null,
        error: err.message || 'An unexpected error occurred in mock service.',
        status: 400,
      };
    }
  }

  // 2. REAL BACKEND API CALL
  const url = `${API_BASE_URL}${endpoint}`;
  const authToken = localStorage.getItem('sr_pg_auth_token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...headers,
  };

  const config = {
    method,
    headers: defaultHeaders,
  };

  if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    let responseData = null;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (responseData && responseData.message) ||
        (responseData && responseData.error) ||
        `Request failed with status ${response.status}`;
      return { data: null, error: errorMessage, status: response.status };
    }

    return { data: responseData, error: null, status: response.status };
  } catch (err) {
    console.error(`[API Network Error] ${method} ${url}:`, err);
    return {
      data: null,
      error: 'Network error or server unreachable. Please verify server connection.',
      status: 0,
    };
  }
}

export default {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};
