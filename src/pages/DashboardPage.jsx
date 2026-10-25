import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RentOverview } from '../components/dashboard/RentOverview';
import { OccupancyBar } from '../components/dashboard/OccupancyBar';
import { EmptyState } from '../components/common/EmptyState';
import dashboardService from '../services/dashboardService';
import { DoorClosed, Plus, RotateCcw } from 'lucide-react';

export const DashboardPage = ({
  onNavigateTab,
  onOpenAddRoom,
  onOpenAddBed,
  onOpenAddTenant,
  onSelectRoomInBedManagement,
}) => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const loadDashboardData = useCallback(async (monthToLoad) => {
    setIsLoading(true);

    try {
      const month = monthToLoad || selectedMonth;
      const response = await dashboardService.getDashboardSummary(month);

      if (response?.data) {
        setSummary(response.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await dashboardService.getDashboardSummary(selectedMonth);
        if (isSubscribed && response?.data) {
          setSummary(response.data);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error('Failed to load dashboard summary:', err);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isSubscribed = false;
    };
  }, [selectedMonth]);

  const handleMonthChange = (newMonth) => {
    if (!newMonth || newMonth === selectedMonth) return;
    setSelectedMonth(newMonth);
  };

  const handleCardClick = (card) => {
    if (card.targetTab) {
      onNavigateTab(card.targetTab);
    } else if (card.id === 'tenants') {
      onNavigateTab('history');
    } else if (card.id === 'rent') {
      onNavigateTab('rent');
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 sm:space-y-6">
      <PageHeader
        title="Property Dashboard"
        subtitle="Real-time occupancy status, room capacity utilization, and collection summary."
        breadcrumbs={[
          { label: 'Home' },
          { label: 'Dashboard' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => loadDashboardData()}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#e5dfd3] bg-white px-3.5 text-xs font-semibold text-emerald-800 shadow-sm hover:bg-slate-50 disabled:opacity-50 sm:text-sm"
          >
            <RotateCcw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        }
      />

      {isLoading && !summary ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-[#e9e3d6] bg-white p-8">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-800 border-t-transparent" />

          <p className="text-center text-sm font-semibold text-slate-600">
            Fetching property occupancy and ledger records...
          </p>
        </div>
      ) : summary?.totalRooms === 0 && summary?.totalBeds === 0 ? (
        <EmptyState
          icon={DoorClosed}
          title="No rooms added yet"
          description="Get started by creating your first room and configuring its bed capacity."
          actionLabel="Add Room"
          actionIcon={Plus}
          onAction={onOpenAddRoom}
        />
      ) : (
        <>
          {/* Quick actions */}
          <QuickActions
            onOpenAddRoom={onOpenAddRoom}
            onOpenAddBed={onOpenAddBed}
            onAddRoom={onOpenAddRoom}
            onAddBed={onOpenAddBed}
            onOpenAddTenant={onOpenAddTenant}
            onAddTenant={onOpenAddTenant}
            onViewBedManagement={() => onNavigateTab('beds')}
          />

          {/* Six property summary cards */}
          <SummaryCards
            summary={summary}
            onCardClick={handleCardClick}
          />

          {/* Payment Doughnut Chart & Collection Comparison */}
          <RentOverview
            rentSummary={summary?.rent}
            month={selectedMonth}
            onMonthChange={handleMonthChange}
          />

          {/* Rent due management */}
          <OccupancyBar
            occupiedBeds={summary?.occupiedBeds || 0}
            availableBeds={summary?.availableBeds || 0}
            maintenanceBeds={summary?.maintenanceBeds || 0}
            totalBeds={summary?.totalBeds || 0}
            occupancyRate={summary?.occupancyRate || 0}
            rentDues={summary?.rentDues || []}
            totalPending={summary?.rent?.pending}
          />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
