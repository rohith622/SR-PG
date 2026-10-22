/**
 * Bed Service
 * Encapsulates all Bed-related API requests and response transformations.
 * Backend contract endpoints:
 * - GET   /api/rooms/:roomId/beds    - List beds for selected room
 * - POST  /api/rooms/:roomId/beds    - Create a bed after server-side duplicate & capacity checks
 * - GET   /api/beds                  - List all beds across property
 * - PATCH /api/beds/:bedId/status    - Update bed status (Available / Maintenance)
 * - POST  /api/beds/:bedId/transfer  - Transfer tenant between beds
 */

import apiClient from './apiClient';
import { storage } from './storageService';

const BED_ENDPOINTS = {
  LIST_BY_ROOM: (roomId) => `/api/rooms/${roomId}/beds`,
  CREATE_IN_ROOM: (roomId) => `/api/rooms/${roomId}/beds`,
  ALL_BEDS: '/api/beds',
  UPDATE_STATUS: (bedId) => `/api/beds/${bedId}/status`,
  TRANSFER: (bedId) => `/api/beds/${bedId}/transfer`,
};

export const bedService = {
  /**
   * Fetch beds configured for a specific room
   */
  async getBedsByRoom(roomId) {
    return apiClient.get(BED_ENDPOINTS.LIST_BY_ROOM(roomId), {
      mockHandler: () => storage.getBedsByRoom(roomId),
    });
  },

  /**
   * Fetch all beds across the entire property
   */
  async getAllBeds() {
    return apiClient.get(BED_ENDPOINTS.ALL_BEDS, {
      mockHandler: () => storage.getAllBeds(),
    });
  },

  /**
   * Create a new bed in a room
   * @param {Object} bedData - { roomId, bedNumber, bedType, monthlyRent, status }
   */
  async createBed(bedData) {
    return apiClient.post(BED_ENDPOINTS.CREATE_IN_ROOM(bedData.roomId), bedData, {
      mockHandler: (payload) => storage.createBed(payload),
    });
  },

  /**
   * Update status of a bed (e.g. Available <-> Maintenance)
   */
  async updateBedStatus(bedId, status) {
    return apiClient.patch(BED_ENDPOINTS.UPDATE_STATUS(bedId), { status }, {
      mockHandler: () => storage.updateBedStatus(bedId, status),
    });
  },

  /**
   * Transfer tenant to another bed
   */
  async transferBed(tenantId, newBedId) {
    return apiClient.post(BED_ENDPOINTS.TRANSFER(newBedId), { tenantId, newBedId }, {
      mockHandler: () => storage.transferBed(tenantId, newBedId),
    });
  },
};

export default bedService;
