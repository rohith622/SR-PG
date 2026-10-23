import  { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { OccupancyBar } from '../components/dashboard/OccupancyBar';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RentOverview } from '../components/dashboard/RentOverview';
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

  const handleRoomClick = (room) => {
    if (onSelectRoomInBedManagement) {
      onSelectRoomInBedManagement(room);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Property Dashboard"
        subtitle="Real-time occupancy status, room capacity utilization, and collection summary."
        breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
      />

      {/* Loading Skeleton */}
      {isLoading && !summary ? (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-600">
            Fetching property occupancy and ledger records...
          </p>
        </div>
      ) : summary?.totalRooms === 0 ? (
        /* Empty State (PDF Page 3: "Use empty states such as No rooms added yet — Add Room") */
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
          {/* 1. Quick Actions Banner */}
          <QuickActions
            onAddRoom={onOpenAddRoom}
            onAddBed={onOpenAddBed}
            onAddTenant={onOpenAddTenant}
            onViewBedManagement={() => onNavigateTab('beds')}
          />

          {/* 2. Top Summary Cards */}
          <SummaryCards summary={summary} onCardClick={handleCardClick} />

          {/* 3. Occupancy Bar */}
          <OccupancyBar
            occupiedBeds={summary?.occupiedBeds || 0}
            availableBeds={summary?.availableBeds || 0}
            maintenanceBeds={summary?.maintenanceBeds || 0}
            totalBeds={summary?.totalBeds || 0}
            occupancyRate={summary?.occupancyRate || 0}
          />

          {/* 4. Room Overview Table */}
          {/* <RoomOverview
            rooms={summary?.roomOverview || []}
            onSelectRoom={handleRoomClick}
            onViewAllRooms={() => onNavigateTab('beds')}
          /> */}

          {/* 5. Rent Cashflow & Recent Activity */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
            <RentOverview
              rentSummary={summary?.rent}
              onManageBeds={() => onNavigateTab('beds')}
            />
            {/* <RecentActivityList activities={summary?.recentActivities || []} /> */}
          {/* </div> */}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
