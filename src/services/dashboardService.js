/**
 * Dashboard Aggregation Service
 * Collects real computed metrics across rooms, beds, tenants, rent dues, and upcoming vacates.
 */

import apiClient from './apiClient';

const getCurrentMonthString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formatDateToDisplay = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const cleanDate = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
    const d = new Date(cleanDate);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
};

export const dashboardService = {
  async getDashboardSummary(targetMonth) {
    const currentMonth = targetMonth || getCurrentMonthString();
    const todayStr = new Date().toISOString().slice(0, 10);

    try {
      const [roomsRes, bedsRes, tenantsRes, paymentsRes] = await Promise.all([
        apiClient.get('/api/management?type=room'),
        apiClient.get('/api/management?type=bed'),
        apiClient.get(`/api/tenants?month=${currentMonth}&limit=1000`),
        apiClient.get(`/api/rent-payments?month=${currentMonth}&limit=1000`),
      ]);

      const rooms =
        roomsRes?.data?.data?.items || roomsRes?.data?.items || [];
      const beds =
        bedsRes?.data?.data?.items || bedsRes?.data?.items || [];
      const rawTenants =
        tenantsRes?.data?.data?.tenants ||
        tenantsRes?.data?.data?.items ||
        tenantsRes?.data?.tenants ||
        tenantsRes?.data?.items ||
        [];
      const rawPayments =
        paymentsRes?.data?.data?.payments ||
        paymentsRes?.data?.payments ||
        [];

      const totalRooms = rooms.length;
      const totalBeds = beds.length;
      const occupiedBeds = beds.filter(
        (b) => String(b.status || '').toLowerCase() === 'occupied'
      ).length;
      const availableBeds = beds.filter(
        (b) => String(b.status || '').toLowerCase() === 'available'
      ).length;
      const maintenanceBeds = beds.filter(
        (b) => String(b.status || '').toLowerCase() === 'maintenance'
      ).length;

      const activeTenantsList = rawTenants.filter(
        (t) => t.tenantStatus !== 'CheckedOut'
      );
      const activeTenants = activeTenantsList.length;

      const occupancyRate =
        totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      // Rent and dues calculation
      let totalRentPending = 0;
      let totalRentCollected = rawPayments.reduce(
        (sum, p) => sum + (Number(p.amountPaid) || 0),
        0
      );
      let overdueCount = 0;
      let dueSoonCount = 0;
      const rentDues = [];

      activeTenantsList.forEach((t) => {
        const monthlyRent = Number(t.monthlyRent) || 0;
        const rentData = t.rent || {};
        const amountPaid = Number(rentData.amountPaid) || 0;
        const outstanding =
          rentData.outstandingAmount !== undefined
            ? Number(rentData.outstandingAmount)
            : Math.max(0, monthlyRent - amountPaid);

        const dueDate =
          rentData.rentDueDate ||
          `${currentMonth}-${String(t.dueDay || 5).padStart(2, '0')}`;

        if (outstanding > 0) {
          totalRentPending += outstanding;

          let status = 'UPCOMING';
          if (dueDate < todayStr) {
            status = 'OVERDUE';
            overdueCount++;
          } else if (dueDate === todayStr) {
            status = 'DUE TODAY';
            dueSoonCount++;
          } else {
            status = 'UPCOMING';
            dueSoonCount++;
          }

          rentDues.push({
            id: String(t.id || t._id),
            name: t.fullName || t.name || 'Tenant',
            phone: t.phone || '',
            roomNumber: String(t.room?.roomNumber || t.roomNumber || '—'),
            amountDue: outstanding,
            dueDate: formatDateToDisplay(dueDate),
            rawDueDate: dueDate,
            status,
          });
        }
      });

      // Sort rent dues: Overdue first, then Due Today, then Upcoming
      const statusWeight = { OVERDUE: 0, 'DUE TODAY': 1, UPCOMING: 2 };
      rentDues.sort((a, b) => {
        const weightDiff =
          (statusWeight[a.status] ?? 3) - (statusWeight[b.status] ?? 3);
        if (weightDiff !== 0) return weightDiff;
        return (a.rawDueDate || '').localeCompare(b.rawDueDate || '');
      });

      // Vacate reminders calculation (for daily stays and scheduled vacates)
      const vacateReminders = [];
      let vacatingTodayCount = 0;
      let vacatingOverdueCount = 0;

      activeTenantsList.forEach((t) => {
        let expectedDate = t.expectedCheckoutDate;
        if (!expectedDate && t.stayType === 'Daily' && t.joiningDate && t.stayDurationDays) {
          const parts = t.joiningDate.split('-');
          if (parts.length === 3) {
            const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            d.setDate(d.getDate() + Number(t.stayDurationDays));
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dt = String(d.getDate()).padStart(2, '0');
            expectedDate = `${y}-${m}-${dt}`;
          }
        }

        if (expectedDate || t.stayType === 'Daily') {
          let daysLeft = null;
          let status = 'UPCOMING';

          if (expectedDate) {
            const parseDate = (str) => {
              const p = str.split('-');
              return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
            };
            const d1 = parseDate(expectedDate);
            const d2 = parseDate(todayStr);
            daysLeft = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));

            if (daysLeft < 0) {
              status = 'OVERDUE';
              vacatingOverdueCount++;
            } else if (daysLeft === 0) {
              status = 'TODAY';
              vacatingTodayCount++;
            } else if (daysLeft === 1) {
              status = 'TOMORROW';
            } else {
              status = 'UPCOMING';
            }
          }

          vacateReminders.push({
            id: String(t.id || t._id),
            name: t.fullName || t.name || 'Tenant',
            phone: t.phone || '',
            roomNumber: String(t.room?.roomNumber || t.roomNumber || '—'),
            bedNumber: String(t.bed?.bedNumber || t.bedNumber || '—'),
            stayType: t.stayType || 'Daily',
            stayDurationDays: t.stayDurationDays || null,
            dailyRate: t.dailyRate || 0,
            joiningDate: t.joiningDate,
            expectedCheckoutDate: expectedDate,
            formattedDate: formatDateToDisplay(expectedDate),
            daysLeft,
            status,
            notes: t.notes || '',
            monthlyRent: Number(t.monthlyRent) || 0,
          });
        }
      });

      // Sort vacate reminders: Overdue first, then Today, Tomorrow, then Upcoming
      const vacateStatusWeight = { OVERDUE: 0, TODAY: 1, TOMORROW: 2, UPCOMING: 3 };
      vacateReminders.sort((a, b) => {
        const diff = (vacateStatusWeight[a.status] ?? 4) - (vacateStatusWeight[b.status] ?? 4);
        if (diff !== 0) return diff;
        return (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999);
      });

      const summary = {
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
        rentDues,
        vacateReminders,
        vacatingTodayCount,
        vacatingOverdueCount,
        vacatingSoonCount: vacateReminders.length,
        roomOverview: rooms,
      };

      return {
        data: summary,
        error: null,
      };
    } catch (err) {
      console.error('[DashboardService] Error fetching summary:', err);
      return {
        data: null,
        error: err?.message || 'Failed to fetch dashboard data',
      };
    }
  },
};

export default dashboardService;
