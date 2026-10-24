
import { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { QuickActions } from '../components/dashboard/QuickActions';
import { OccupancyBar } from '../components/dashboard/OccupancyBar';
import { EmptyState } from '../components/common/EmptyState';
import dashboardService from '../services/dashboardService';
import { DoorClosed, Plus } from 'lucide-react';

export const DashboardPage = ({
  onNavigateTab,
  onOpenAddRoom,
  onOpenAddBed,
  onOpenAddTenant,
  onSelectRoomInBedManagement,
}) => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);

    try {
      const response = await dashboardService.getDashboardSummary();

      if (response.data) {
        setSummary(response.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCardClick = (card) => {
    if (card.targetTab) {
      onNavigateTab(card.targetTab);
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
      />

      {isLoading && !summary ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-[#e9e3d6] bg-white p-8">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-800 border-t-transparent" />

          <p className="text-center text-sm font-semibold text-slate-600">
            Fetching property occupancy and ledger records...
          </p>
        </div>
      ) : summary?.totalRooms === 0 ? (
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
            onAddRoom={onOpenAddRoom}
            onAddBed={onOpenAddBed}
            onAddTenant={onOpenAddTenant}
            onViewBedManagement={() => onNavigateTab('beds')}
          />

          {/* Six property summary cards */}
          <SummaryCards
            summary={summary}
            onCardClick={handleCardClick}
          />

          {/* Rent due management */}
          <OccupancyBar
            occupiedBeds={summary?.occupiedBeds || 0}
            availableBeds={summary?.availableBeds || 0}
            maintenanceBeds={summary?.maintenanceBeds || 0}
            totalBeds={summary?.totalBeds || 0}
            occupancyRate={summary?.occupancyRate || 0}
          />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
