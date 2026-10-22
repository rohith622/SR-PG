/**
 * Dashboard Aggregation Service
 * Collects real computed metrics across rooms, beds, tenants, and recent activities.
 */

import apiClient from './apiClient';
import { storage } from './storageService';

export const dashboardService = {
  async getDashboardSummary() {
    return apiClient.get('/api/dashboard/summary', {
      mockHandler: () => {
        const rooms = storage.getRooms();
        const beds = storage.getAllBeds();
        const tenants = storage.getTenants();
        const activities = storage.getActivities();

        const totalRooms = rooms.length;
        const totalBeds = beds.length;
        const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
        const availableBeds = beds.filter((b) => b.status === 'Available').length;
        const maintenanceBeds = beds.filter((b) => b.status === 'Maintenance').length;
        const activeTenants = tenants.length;

        // Rent calculations
        let totalRentPending = 0;
        let totalRentCollected = 0;
        let dueSoonCount = 0;
        let overdueCount = 0;

        tenants.forEach((t) => {
          totalRentPending += Number(t.pendingRentAmount || 0);
          if (t.rentStatus === 'Overdue') overdueCount++;
          if (t.rentStatus === 'Due Soon') dueSoonCount++;
          
          (t.paymentHistory || []).forEach((p) => {
            totalRentCollected += Number(p.amount || 0);
          });
        });

        const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

        return {
          totalRooms,
          totalBeds,
          occupiedBeds,
          availableBeds,
          maintenanceBeds,
          activeTenants,
          occupancyRate,
          rent: {
            pending: totalRentPending,
            collected: totalRentCollected,
            dueSoonCount,
            overdueCount,
          },
          roomOverview: rooms,
          recentActivities: activities.slice(0, 8),
        };
      },
    });
  },
};

export default dashboardService;
