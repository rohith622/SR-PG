/**
 * Tenant History Service
 * Encapsulates auditable records of stays and checkout outcomes.
 * Backend endpoints:
 * - GET /api/tenants               - Search and list all stays (Active & CheckedOut)
 * - PUT /api/tenants/:id           - Update stay status (e.g. Checkout or Reactivate)
 */

import apiClient from './apiClient';
import { storage } from './storageService';

const HISTORY_ENDPOINTS = {
  LIST: '/api/tenants',
  GET_BY_ID: (id) => `/api/tenants/${id}`,
  UPDATE: (id) => `/api/tenants/${id}`,
};

export const tenantHistoryService = {
  /**
   * Fetch tenant stays with optional filters (status, search, floor, dates)
   */
  async getTenantHistory(params = {}) {
    return apiClient.get(HISTORY_ENDPOINTS.LIST, {
      params,
      mockHandler: () => storage.getTenantHistory(),
    });
  },

  /**
   * Fetch a single stay record with checkout breakdown
   */
  async getHistoryRecordById(id) {
    return apiClient.get(HISTORY_ENDPOINTS.GET_BY_ID(id), {
      mockHandler: () => storage.getHistoryRecordById(id),
    });
  },

  /**
   * Checkout a tenant and release bed
   */
  async checkoutTenant(id, checkoutDate) {
    return apiClient.put(HISTORY_ENDPOINTS.UPDATE(id), {
      tenantStatus: 'CheckedOut',
      checkoutDate: checkoutDate || new Date().toISOString().split('T')[0],
    });
  },

  /**
   * Reactivate a checked out tenant
   */
  async reactivateTenant(id) {
    return apiClient.put(HISTORY_ENDPOINTS.UPDATE(id), {
      tenantStatus: 'Active',
      checkoutDate: null,
    });
  },
};

export default tenantHistoryService;
