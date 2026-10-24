import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useToast } from "../common/Toast";
import { AppShell } from "./AppShell";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { DashboardPage } from "../../pages/DashboardPage";
import { AddRoomModal } from "../rooms/AddRoomModal";

import { storage, resetToSampleData } from "../../services/storageService";

import roomService from "../../services/roomService";
import bedService from "../../services/bedService";

import BedManagement from "../../pages/BedManagementPage";
import TenantHistoryPage from "../../pages/TenantHistoryPage";
import RentPaymentPage from "../../pages/RentPaymentPage";

function MainApp() {
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine the selected page from the current URL.
  const currentTab = location.pathname.startsWith("/admin/beds")
    ? "beds"
    : location.pathname.startsWith("/admin/tenant-history")
      ? "history"
      : location.pathname.startsWith("/admin/rent-payments")
        ? "rent"
        : "dashboard";

  // Navigate instead of changing only local tab state.
  const setCurrentTab = (tab) => {
    const routes = {
      dashboard: "/admin/dashboard",
      beds: "/admin/beds",
      history: "/admin/tenant-history",
      rent: "/admin/rent-payments",
    };

    navigate(routes[tab] || "/admin/dashboard");
  };

  // Property information.
  const [propertyInfo, setPropertyInfo] = useState(null);

  // Shared room and bed data.
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);

  // Modal state.
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  const [addBedState, setAddBedState] = useState({
    isOpen: false,
    preselectedRoom: null,
  });

  const [addTenantState, setAddTenantState] = useState({
    isOpen: false,
    preselectedBed: null,
  });

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  // Refresh data after management changes.
  const [refreshKey, setRefreshKey] = useState(0);

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
      setAvailableBeds(allBeds.filter((bed) => bed.status === "Available"));
    } catch (err) {
      console.error("Failed to load modal reference data:", err);
    }
  };

  useEffect(() => {
    refreshModalData();
  }, [refreshKey]);

  // Add Room / Bed / Tenant workflows.
  const handleOpenAddRoom = () => {
    refreshModalData();
    setIsAddRoomOpen(true);
  };

  const handleOpenAddBed = (room = null) => {
    refreshModalData();

    setAddBedState({
      isOpen: true,
      preselectedRoom:
        room ||
        (selectedRoomId
          ? availableRooms.find((item) => item.id === selectedRoomId)
          : null),
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
    setRefreshKey((key) => key + 1);
    setSelectedRoomId(newRoom.id);
    setCurrentTab("beds");
  };

  const handleSelectRoomInBedManagement = (room) => {
    setSelectedRoomId(room.id);
    setCurrentTab("beds");
  };

  const handleResetDataConfirm = () => {
    resetToSampleData();
    setRefreshKey((key) => key + 1);
    setIsResetConfirmOpen(false);

    toast.success("Sample demo data restored successfully.");
  };

  const handleSignOutConfirm = () => {
    sessionStorage.removeItem("sr_pg_demo_authenticated");
    localStorage.removeItem("sr_pg_auth_token");

    setIsSignOutConfirmOpen(false);

    navigate("/admin/login", { replace: true });

    toast.info("You have signed out.");
  };

  return (
    <AppShell
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onResetData={() => setIsResetConfirmOpen(true)}
      onSignOut={() => setIsSignOutConfirmOpen(true)}
      propertyInfo={propertyInfo}
    >
      {/* Dashboard */}
      {currentTab === "dashboard" && (
        <DashboardPage
          key={`dashboard-${refreshKey}`}
          onNavigateTab={setCurrentTab}
          onOpenAddRoom={handleOpenAddRoom}
          onOpenAddBed={() => handleOpenAddBed(null)}
          onOpenAddTenant={() => handleOpenAddTenant(null)}
          onSelectRoomInBedManagement={handleSelectRoomInBedManagement}
        />
      )}

      {/* Bed Management */}
      {currentTab === "beds" && <BedManagement key={`beds-${refreshKey}`} />}

      {/* Tenant History */}
      {currentTab === "history" && (
        <TenantHistoryPage key={`history-${refreshKey}`} />
      )}

      {/* Rent Payments */}
      {currentTab === "rent" && <RentPaymentPage key={`rent-${refreshKey}`} />}

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        onRoomCreated={handleRoomCreated}
      />

      {/* Reset Demo Data Confirmation */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetDataConfirm}
        title="Reset to Sample Demo Data?"
        message="This will reset all rooms, beds, active tenants, and checkout histories to the initial seed dataset. Any changes made during testing will be reset."
        confirmLabel="Reset Data"
        variant="danger"
      />

      {/* Sign Out Confirmation */}
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

export default function AdminLayout() {
  return <MainApp />;
}
