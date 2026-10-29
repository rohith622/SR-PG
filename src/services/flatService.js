/**
 * Flat Service
 * Encapsulates all Flat-related API requests and response transformations.
 * Endpoints:
 * - GET    /api/management?type=flat
 * - GET    /api/management?type=flat&floorId=FLOOR_ID
 * - POST   /api/management/create (with type: "flat")
 * - PUT    /api/management/:id?type=flat
 * - DELETE /api/management/:id?type=flat
 */

import apiClient from "./apiClient";
import { storage } from "./storageService";

export const flatService = {
  /**
   * Fetch all flats or flats filtered by floor.
   * GET /api/management?type=flat
   * GET /api/management?type=flat&floorId=FLOOR_ID
   */
  async getFlats(floorId = null) {
    return apiClient.get("/api/management", {
      params: {
        type: "flat",
        ...(floorId ? { floorId } : {}),
      },
      mockHandler: () => storage.getFlats(floorId),
    });
  },

  /**
   * Fetch a single flat by ID
   */
  async getFlatById(flatId) {
    return apiClient.get(`/api/management/${flatId}?type=flat`, {
      mockHandler: () => storage.getFlatById(flatId),
    });
  },

  /**
   * Create a new flat on a floor
   * @param {Object} flatData - { floorId, flatNumber, name, description }
   */
  async createFlat(flatData) {
    return apiClient.post(
      "/api/management/create",
      {
        type: "flat",
        ...flatData,
      },
      {
        mockHandler: (payload) => storage.createFlat(payload),
      }
    );
  },

  /**
   * Update an existing flat
   */
  async updateFlat(flatId, flatData) {
    return apiClient.put(`/api/management/${flatId}?type=flat`, flatData, {
      mockHandler: (payload) => storage.updateFlat(flatId, payload),
    });
  },

  /**
   * Delete a flat (must have no linked rooms)
   */
  async deleteFlat(flatId) {
    return apiClient.delete(`/api/management/${flatId}?type=flat`, {
      mockHandler: () => storage.deleteFlat(flatId),
    });
  },
};

export default flatService;
