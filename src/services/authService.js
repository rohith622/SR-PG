
import apiClient from './apiClient';
import { storage } from './storageService';

const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  CURRENT_USER: '/api/auth/me',
  LOGOUT: '/api/auth/logout',
};

const TOKEN_KEY = 'sr_pg_auth_token';
const USER_KEY = 'sr_pg_auth_user';

const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('sr_pg_auth_user');
  sessionStorage.removeItem('sr_pg_demo_authenticated');
};

export const authService = {
  async login({ email, password }) {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
      email: email.trim(),
      password,
    });

    if (response.error) {
      throw new Error(response.error);
    }

    const result = response.data;
    const admin = result?.data?.admin;
    const token = result?.data?.token;

    if (result?.status !== 'success' || !token || !admin) {
      throw new Error(
        result?.message || 'Invalid login response from server.'
      );
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(admin));

    return { admin, token };
  },

  async getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      const error = new Error('No authentication token found.');
      error.status = 401;
      throw error;
    }

    const response = await apiClient.get(AUTH_ENDPOINTS.CURRENT_USER);

    if (response.error) {
      const error = new Error(response.error);
      error.status = response.status;
      throw error;
    }

    const result = response.data;

    // Supports common backend response structures.
    const admin =
      result?.data?.admin ??
      result?.data?.user ??
      result?.data ??
      result?.admin ??
      result?.user;

    if (
      result?.status === 'error' ||
      !admin ||
      typeof admin !== 'object' ||
      Array.isArray(admin)
    ) {
      throw new Error('Unable to validate the current admin session.');
    }

    localStorage.setItem(USER_KEY, JSON.stringify(admin));

    return admin;
  },

  async logout() {
    clearStoredSession();
    return { success: true };
  },

  clearStoredSession,

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
