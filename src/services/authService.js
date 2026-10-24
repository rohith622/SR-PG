
import apiClient from './apiClient';
import { storage } from './storageService';

const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  CURRENT_USER: '/api/auth/me',
  LOGOUT: '/api/auth/logout',
};

const TOKEN_KEY = 'sr_pg_auth_token';
const USER_KEY = 'sr_pg_auth_user';

const MOCK_USER = {
  id: 'usr-1',
  name: 'S. Rohith',
  email: 'rohith@srluxurypg.in',
  role: 'Property Owner / Admin',
  avatar: null,
};

function getPayload(response) {
  return response?.data;
}

export const authService = {
  async login(credentials) {
    const response = await apiClient.post(
      AUTH_ENDPOINTS.LOGIN,
      {
        email: credentials.email,
        password: credentials.password,
      }
    );

    if (response.error) {
      throw new Error(response.error);
    }

    const result = getPayload(response);

    // Supports common response structures:
    // { token, admin }, { data: { token, admin } }
    const payload = result?.data ?? result;
    const token = payload?.token || payload?.accessToken;
    const user = payload?.admin || payload?.user || null;

    if (!token) {
      throw new Error(
        'Login succeeded but no authentication token was returned.'
      );
    }

    localStorage.setItem(TOKEN_KEY, token);

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return { token, user };
  },

  async getCurrentUser() {
    const response = await apiClient.get(
      AUTH_ENDPOINTS.CURRENT_USER,
      {
        mockHandler: () => MOCK_USER,
      }
    );

    if (response.error) {
      throw new Error(response.error);
    }

    const result = getPayload(response);
    const user = result?.data ?? result;

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return { data: user, error: null };
  },

  async logout() {
    try {
      const response = await apiClient.post(
        AUTH_ENDPOINTS.LOGOUT,
        {},
        {
          mockHandler: () => ({ success: true }),
        }
      );

      // A missing backend logout endpoint should not prevent
      // clearing the local session.
      return response;
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser() {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },

  async getPropertyInfo() {
    return apiClient.get('/api/property', {
      mockHandler: () => storage.getPropertyInfo(),
    });
  },
};

export default authService;
