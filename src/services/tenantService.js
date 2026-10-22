/**
 * Tenant Service
 * Encapsulates all Tenant allocation, checkout, and rent payment API requests.
 * Backend contract endpoints:
 * - GET  /api/tenants                    - List active tenants
 * - GET  /api/tenants/:id                - Single tenant details with payment ledger
 * - POST /api/tenants                    - Create tenant/stay & allocate bed atomically
 * - POST /api/tenants/:id/checkout       - Close stay, record dues/deposit, release bed atomically
 * - POST /api/tenants/:id/payments       - Record a rent payment entry into ledger
 */

import apiClient from './apiClient';
import { storage } from './storageService';

const TENANT_ENDPOINTS = {
  LIST: '/api/tenants',
  GET_BY_ID: (id) => `/api/tenants/${id}`,
  CREATE: '/api/tenants',
  CHECKOUT: (id) => `/api/tenants/${id}/checkout`,
  RECORD_PAYMENT: (id) => `/api/tenants/${id}/payments`,
};

export const tenantService = {
  /**
   * Fetch all active tenants
   */
  async getActiveTenants() {
    return apiClient.get(TENANT_ENDPOINTS.LIST, {
      mockHandler: () => storage.getTenants(),
    });
  },

  /**
   * Fetch single tenant details
   */
  async getTenantById(tenantId) {
    return apiClient.get(TENANT_ENDPOINTS.GET_BY_ID(tenantId), {
      mockHandler: () => storage.getTenantById(tenantId),
    });
  },

  /**
   * Register tenant and assign bed atomically
   */
  async createTenant(tenantData) {
    return apiClient.post(TENANT_ENDPOINTS.CREATE, tenantData, {
      mockHandler: (payload) => storage.createTenantStay(payload),
    });
  },

  /**
   * Perform tenant checkout, compute refund/deductions, and release bed atomically
   */
  async checkoutTenant(tenantId, checkoutData) {
    return apiClient.post(TENANT_ENDPOINTS.CHECKOUT(tenantId), checkoutData, {
      mockHandler: (payload) => storage.checkoutTenant(tenantId, payload),
    });
  },

  /**
   * Record a rent payment entry for a tenant
   */
  async recordPayment(tenantId, paymentData) {
    return apiClient.post(TENANT_ENDPOINTS.RECORD_PAYMENT(tenantId), paymentData, {
      mockHandler: (payload) => storage.recordRentPayment(tenantId, payload),
    });
  },
};

export default tenantService;
