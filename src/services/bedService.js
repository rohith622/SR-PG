
/**
 * Bed Service
 * Handles floor, room, and bed API requests.
 *
 * Management GET endpoints:
 * - GET /api/management?type=floor
 * - GET /api/management?type=room
 * - GET /api/management?type=room&floorId=FLOOR_ID
 * - GET /api/management?type=bed
 * - GET /api/management?type=bed&roomId=ROOM_ID
 * - GET /api/management?type=bed&floorId=FLOOR_ID
 *
 * Existing bed endpoints:
 * - GET   /api/rooms/:roomId/beds
 * - POST  /api/rooms/:roomId/beds
 * - GET   /api/beds
 * - PATCH /api/beds/:bedId/status
 * - POST  /api/beds/:bedId/transfer
 */

import apiClient from "./apiClient";
import { storage } from "./storageService";

const BED_ENDPOINTS = {
  MANAGEMENT: "/api/management",

  LIST_BY_ROOM: (roomId) => `/api/rooms/${roomId}/beds`,
  CREATE_IN_ROOM: (roomId) => `/api/rooms/${roomId}/beds`,
  ALL_BEDS: "/api/beds",
  UPDATE_STATUS: (bedId) => `/api/beds/${bedId}/status`,
  TRANSFER: (bedId) => `/api/beds/${bedId}/transfer`,
};

export const bedService = {
  // ==========================================
  // FLOOR GET APIs
  // ==========================================

  /**
   * Fetch all floors.
   * GET /api/management?type=floor
   */
  async getAllFloors() {
    return apiClient.get(BED_ENDPOINTS.MANAGEMENT, {
      params: {
        type: "floor",
      },
    });
  },

  // ==========================================
  // FLAT GET APIs
  // ==========================================

  /**
   * Fetch all flats or flats filtered by floor.
   * GET /api/management?type=flat
   * GET /api/management?type=flat&floorId=FLOOR_ID
   */
  async getAllFlats({ floorId } = {}) {
    return apiClient.get(BED_ENDPOINTS.MANAGEMENT, {
      params: {
        type: "flat",
        ...(floorId ? { floorId } : {}),
      },
    });
  },

  // ==========================================
  // ROOM GET APIs
  // ==========================================

  /**
   * Fetch all rooms or rooms filtered by floor.
   * GET /api/management?type=room
   * GET /api/management?type=room&floorId=FLOOR_ID
   */
  async getRoomsByFloor(floorId) {
    return apiClient.get(BED_ENDPOINTS.MANAGEMENT, {
      params: {
        type: "room",
        ...(floorId ? { floorId } : {}),
      },
    });
  },

  // ==========================================
  // MANAGEMENT BED GET APIs
  // ==========================================

  /**
   * Fetch all management beds or filter by room/floor.
   * GET /api/management?type=bed
   * GET /api/management?type=bed&roomId=ROOM_ID
   * GET /api/management?type=bed&floorId=FLOOR_ID
   */
  async getManagementBeds({ roomId, floorId } = {}) {
    return apiClient.get(BED_ENDPOINTS.MANAGEMENT, {
      params: {
        type: "bed",
        ...(roomId ? { roomId } : {}),
        ...(floorId ? { floorId } : {}),
      },
    });
  },

  // ==========================================
  // EXISTING BED GET APIs
  // ==========================================

  /**
   * Fetch beds configured for a specific room.
   * Existing endpoint retained.
   */
  async getBedsByRoom(roomId) {
    return apiClient.get(BED_ENDPOINTS.LIST_BY_ROOM(roomId), {
      mockHandler: () => storage.getBedsByRoom(roomId),
    });
  },

  /**
   * Fetch all beds across the property.
   * Existing endpoint retained.
   */
  async getAllBeds() {
    return apiClient.get(BED_ENDPOINTS.ALL_BEDS, {
      mockHandler: () => storage.getAllBeds(),
    });
  },

  // ==========================================
  // EXISTING BED CREATE API
  // ==========================================

  /**
   * Create a new bed in a room.
   * @param {Object} bedData
   * { roomId, bedNumber, bedType, monthlyRent, status }
   */
  async createBed(bedData) {
    return apiClient.post(
      BED_ENDPOINTS.CREATE_IN_ROOM(bedData.roomId),
      bedData,
      {
        mockHandler: (payload) => storage.createBed(payload),
      }
    );
  },

  // ==========================================
  // EXISTING BED STATUS API
  // ==========================================

  /**
   * Update bed status.
   * Available / Maintenance
   */
  async updateBedStatus(bedId, status) {
    return apiClient.patch(
      BED_ENDPOINTS.UPDATE_STATUS(bedId),
      { status },
      {
        mockHandler: () => storage.updateBedStatus(bedId, status),
      }
    );
  },

  // ==========================================
  // EXISTING BED TRANSFER API
  // ==========================================

  /**
   * Transfer a tenant to another bed.
   */
  async transferBed(tenantId, newBedId) {
    return apiClient.post(
      BED_ENDPOINTS.TRANSFER(newBedId),
      { tenantId, newBedId },
      {
        mockHandler: () =>
          storage.transferBed(tenantId, newBedId),
      }
    );
  },
};

export default bedService;
