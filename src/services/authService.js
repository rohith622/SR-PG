/**
 * Authentication & Account Service
 */

import apiClient from './apiClient';
import { storage } from './storageService';

const AUTH_ENDPOINTS = {
  CURRENT_USER: '/api/auth/me',
  LOGOUT: '/api/auth/logout',
};

const MOCK_USER = {
  id: 'usr-1',
  name: 'S. Rohith',
  email: 'rohith@srluxurypg.in',
  role: 'Property Owner / Admin',
  avatar: null,
};

export const authService = {
  async getCurrentUser() {
    return apiClient.get(AUTH_ENDPOINTS.CURRENT_USER, {
      mockHandler: () => MOCK_USER,
    });
  },

  async logout() {
    return apiClient.post(AUTH_ENDPOINTS.LOGOUT, {}, {
      mockHandler: () => {
        localStorage.removeItem('sr_pg_auth_token');
        return { success: true };
      },
    });
  },

  async getPropertyInfo() {
    return apiClient.get('/api/property', {
      mockHandler: () => storage.getPropertyInfo(),
    });
  },
};

export default authService;
