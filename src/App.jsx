import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/common/Toast';
import { AppShell } from './components/layout/AppShell';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { DashboardPage } from './pages/DashboardPage';
import { BedManagementPage } from './pages/BedManagementPage';
import { TenantHistoryPage } from './pages/TenantHistoryPage';
import { AddRoomModal } from './components/rooms/AddRoomModal';
import { AddBedModal } from './components/beds/AddBedModal';
import { AddTenantModal } from './components/tenants/AddTenantModal';
import { storage, resetToSampleData } from './services/storageService';
import roomService from './services/roomService';
import bedService from './services/bedService';

function MainApp() {
  const toast = useToast();

  // Primary 3-tab navigation state
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Property info
  const [propertyInfo, setPropertyInfo] = useState(null);

  // Cross-screen room/bed preselection state
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);

  // Contextual modals state
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [addBedState, setAddBedState] = useState({ isOpen: false, preselectedRoom: null });
  const [addTenantState, setAddTenantState] = useState({ isOpen: false, preselectedBed: null });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  // Refresh trigger counter to sync state between dashboard and bed management
  const [refreshKey, setRefreshKey] = useState(0);

  // Load shared property and room/bed data for modals
  const refreshModalData = async () => {
    try {
      const propInfo = storage.getPropertyInfo();
      setPropertyInfo(propInfo);

      const [roomsRes, bedsRes] = await Promise.all([
        roomService.getRooms(),
        bedService.getAllBeds(),
      ]);

      setAvailableRooms(roomsRes.data || []);
      const allBeds = bedsRes.data || [];
      setAvailableBeds(allBeds.filter((b) => b.status === 'Available'));
    } catch (err) {
      console.error('Failed to load modal reference data:', err);
    }
  };

  useEffect(() => {
    refreshModalData();
  }, [refreshKey]);

  // Handlers for Add Room / Add Bed / Add Tenant workflows
  const handleOpenAddRoom = () => {
    refreshModalData();
    setIsAddRoomOpen(true);
  };

  const handleOpenAddBed = (room = null) => {
    refreshModalData();
    setAddBedState({
      isOpen: true,
      preselectedRoom: room || (selectedRoomId ? availableRooms.find((r) => r.id === selectedRoomId) : null),
    });
  };

  const handleOpenAddTenant = (bed = null) => {
    refreshModalData();
    setAddTenantState({
      isOpen: true,
      preselectedBed: bed,
    });
  };

  const handleRoomCreated = (newRoom) => {
    setRefreshKey((k) => k + 1);
    // As per Page 5: "After a successful save, return to Bed Management and focus the newly created room."
    setSelectedRoomId(newRoom.id);
    setCurrentTab('beds');
  };

  const handleBedCreated = (newBed) => {
    setRefreshKey((k) => k + 1);
    if (newBed.roomId) {
      setSelectedRoomId(newBed.roomId);
    }
  };

  const handleTenantCreated = (newTenant) => {
    setRefreshKey((k) => k + 1);
    if (newTenant.roomId) {
      setSelectedRoomId(newTenant.roomId);
    }
  };

  const handleSelectRoomInBedManagement = (room) => {
    setSelectedRoomId(room.id);
    setCurrentTab('beds');
  };

  const handleResetDataConfirm = () => {
    resetToSampleData();
    setRefreshKey((k) => k + 1);
    setIsResetConfirmOpen(false);
    toast.success('Sample demo data restored successfully.');
  };

  const handleSignOutConfirm = () => {
    localStorage.removeItem('sr_pg_auth_token');
    setIsSignOutConfirmOpen(false);
    toast.info('You have signed out. (In backend mode, redirects to login).');
  };

  return (
    <AppShell
      currentTab={currentTab}
      onSelectTab={(tab) => setCurrentTab(tab)}
      onResetData={() => setIsResetConfirmOpen(true)}
      onSignOut={() => setIsSignOutConfirmOpen(true)}
      propertyInfo={propertyInfo}
    >
      {/* Tab 1: Dashboard */}
      {currentTab === 'dashboard' && (
        <DashboardPage
          key={`dashboard-${refreshKey}`}
          onNavigateTab={(tab) => setCurrentTab(tab)}
          onOpenAddRoom={handleOpenAddRoom}
          onOpenAddBed={() => handleOpenAddBed(null)}
          onOpenAddTenant={() => handleOpenAddTenant(null)}
          onSelectRoomInBedManagement={handleSelectRoomInBedManagement}
        />
      )}

      {/* Tab 2: Bed Management */}
      {currentTab === 'beds' && (
        <BedManagementPage
          key={`beds-${refreshKey}`}
          initialSelectedRoomId={selectedRoomId}
          onOpenAddRoom={handleOpenAddRoom}
          onOpenAddBed={(room) => handleOpenAddBed(room)}
          onOpenAddTenant={(bed) => handleOpenAddTenant(bed)}
        />
      )}

      {/* Tab 3: Tenant History */}
      {currentTab === 'history' && (
        <TenantHistoryPage key={`history-${refreshKey}`} />
      )}

      {/* Contextual Modal 1: Add Room */}
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        onRoomCreated={handleRoomCreated}
      />

      {/* Contextual Modal 2: Add Bed */}
      <AddBedModal
        isOpen={addBedState.isOpen}
        onClose={() => setAddBedState({ isOpen: false, preselectedRoom: null })}
        rooms={availableRooms}
        selectedRoom={addBedState.preselectedRoom}
        onBedCreated={handleBedCreated}
      />

      {/* Contextual Modal 3: Add Tenant */}
      <AddTenantModal
        isOpen={addTenantState.isOpen}
        onClose={() => setAddTenantState({ isOpen: false, preselectedBed: null })}
        preselectedBed={addTenantState.preselectedBed}
        rooms={availableRooms}
        availableBeds={availableBeds}
        onTenantCreated={handleTenantCreated}
      />

      {/* Confirm Dialog: Reset Demo Data */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetDataConfirm}
        title="Reset to Sample Demo Data?"
        message="This will reset all rooms, beds, active tenants, and checkout histories to the initial seed dataset. Any changes made during testing will be reset."
        confirmLabel="Reset Data"
        variant="danger"
      />

      {/* Confirm Dialog: Sign Out */}
      <ConfirmDialog
        isOpen={isSignOutConfirmOpen}
        onClose={() => setIsSignOutConfirmOpen(false)}
        onConfirm={handleSignOutConfirm}
        title="Sign Out of PG Portal?"
        message="Are you sure you want to log out of the property management portal?"
        confirmLabel="Sign Out"
        variant="primary"
      />
    </AppShell>
  );
}

export function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

export default App;
