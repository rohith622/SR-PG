/**
 * Tenant History Service
 * Encapsulates auditable records of previous stays and checkout outcomes.
 * Backend contract endpoints:
 * - GET /api/tenant-history        - Search and list completed stays
 * - GET /api/tenant-history/:id    - Complete ledger and deposit outcome for a completed stay
 */

import apiClient from './apiClient';
import { storage } from './storageService';

const HISTORY_ENDPOINTS = {
  LIST: '/api/tenant-history',
  GET_BY_ID: (id) => `/api/tenant-history/${id}`,
};

export const tenantHistoryService = {
  /**
   * Fetch all completed stays
   */
  async getTenantHistory() {
    return apiClient.get(HISTORY_ENDPOINTS.LIST, {
      mockHandler: () => storage.getTenantHistory(),
    });
  },

  /**
   * Fetch a single completed stay record with checkout breakdown
   */
  async getHistoryRecordById(id) {
    return apiClient.get(HISTORY_ENDPOINTS.GET_BY_ID(id), {
      mockHandler: () => storage.getHistoryRecordById(id),
    });
  },
};

export default tenantHistoryService;
