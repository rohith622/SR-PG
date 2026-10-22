/**
 * Room Service
 * Encapsulates all Room-related API requests and response transformations.
 * Backend contract endpoints:
 * - GET  /api/rooms               - List rooms and capacity/count information
 * - POST /api/rooms               - Create a new room with capacity & rent
 * - GET  /api/rooms/:roomId       - Retrieve single room details
 */

import apiClient from './apiClient';
import { storage } from './storageService';

const ROOM_ENDPOINTS = {
  LIST: '/api/rooms',
  CREATE: '/api/rooms',
  GET_BY_ID: (roomId) => `/api/rooms/${roomId}`,
};

export const roomService = {
  /**
   * Fetch all rooms with computed bed counts and occupancy status
   */
  async getRooms() {
    return apiClient.get(ROOM_ENDPOINTS.LIST, {
      mockHandler: () => storage.getRooms(),
    });
  },

  /**
   * Fetch a single room by ID
   */
  async getRoomById(roomId) {
    return apiClient.get(ROOM_ENDPOINTS.GET_BY_ID(roomId), {
      mockHandler: () => storage.getRoomById(roomId),
    });
  },

  /**
   * Create a new room
   * @param {Object} roomData - { roomNumber, floor, roomType, capacity, monthlyRent, rentModel, notes, autoCreateBeds }
   */
  async createRoom(roomData) {
    return apiClient.post(ROOM_ENDPOINTS.CREATE, roomData, {
      mockHandler: (payload) => storage.createRoom(payload),
    });
  },
};

export default roomService;
