import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { useToast } from "../common/Toast";
import { AppShell } from "./AppShell";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { DashboardPage } from "../../pages/DashboardPage";
import AddFloorModal from "../common/floors/AddFloorModal";
import AddFlatModal from "../common/flats/AddFlatModal";
import AddRoomModal from "../common/rooms/AddRoomModal";
import AddBedModal from "../common/beds/AddBedModal";
import AddTenantModal from "../common/tenants/AddTenantModal";
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
  const [isAddFloorOpen, setIsAddFloorOpen] = useState(false);
  const [isAddFlatOpen, setIsAddFlatOpen] = useState(false);
  const [addFlatFloorId, setAddFlatFloorId] = useState("");
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddBedOpen, setIsAddBedOpen] = useState(false);
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
    if (refreshKey > 0) {
      refreshModalData();
    }
  }, [refreshKey]);

  // Add Floor / Flat / Room / Bed / Tenant workflows.
  const handleOpenAddFloor = () => {
    refreshModalData();
    setIsAddFloorOpen(true);
  };

  const [addRoomFloorId, setAddRoomFloorId] = useState("");
  const [addRoomFlatId, setAddRoomFlatId] = useState("");

  const handleOpenAddFlat = (floorId = "") => {
    refreshModalData();
    setAddFlatFloorId(floorId);
    setIsAddFlatOpen(true);
  };

  const handleOpenAddRoom = (floorId = "", flatId = "") => {
    refreshModalData();
    setAddRoomFloorId(floorId || "");
    setAddRoomFlatId(flatId || "");
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

    setIsAddBedOpen(true);
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

  const handleSignOutConfirm = async () => {
    try {
      await authService.logout();
      console.log(
        "Token after logout:",
        localStorage.getItem("sr_pg_auth_token"),
      );
      setIsSignOutConfirmOpen(false);
      navigate("/admin/login", { replace: true });
      toast.info("You have signed out.");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Unable to sign out. Please try again.");
    }
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
          onOpenAddFloor={handleOpenAddFloor}
          onOpenAddFlat={handleOpenAddFlat}
          onOpenAddRoom={handleOpenAddRoom}
          onOpenAddBed={handleOpenAddBed}
          onOpenAddTenant={() => handleOpenAddTenant(null)}
          onSelectRoomInBedManagement={handleSelectRoomInBedManagement}
        />
      )}

      {/* Bed Management */}
      {currentTab === "beds" && (
        <BedManagement
          key={`beds-${refreshKey}`}
          onOpenAddFloor={handleOpenAddFloor}
          onOpenAddFlat={handleOpenAddFlat}
          onOpenAddRoom={() => setIsAddRoomOpen(true)}
          onOpenAddBed={() => handleOpenAddBed()}
          initialSelectedRoomId={selectedRoomId}
        />
      )}

      {/* Tenant History */}
      {currentTab === "history" && (
        <TenantHistoryPage key={`history-${refreshKey}`} />
      )}

      {/* Rent Payments */}
      {currentTab === "rent" && <RentPaymentPage key={`rent-${refreshKey}`} />}

      {/* Add Floor Modal */}
      <AddFloorModal
        isOpen={isAddFloorOpen}
        onClose={() => setIsAddFloorOpen(false)}
        onFloorCreated={async () => {
          setIsAddFloorOpen(false);
          setRefreshKey((key) => key + 1);
          toast.success("Floor created successfully.");
        }}
      />

      {/* Add Flat Modal */}
      <AddFlatModal
        isOpen={isAddFlatOpen}
        preselectedFloorId={addFlatFloorId}
        onClose={() => {
          setIsAddFlatOpen(false);
          setAddFlatFloorId("");
        }}
        onFlatCreated={async () => {
          setIsAddFlatOpen(false);
          setAddFlatFloorId("");
          setRefreshKey((key) => key + 1);
          toast.success("Flat created successfully.");
        }}
      />

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomOpen}
        preselectedFloorId={addRoomFloorId}
        preselectedFlatId={addRoomFlatId}
        onOpenAddFlat={handleOpenAddFlat}
        onClose={() => {
          setIsAddRoomOpen(false);
          setAddRoomFloorId("");
          setAddRoomFlatId("");
        }}
        onRoomCreated={(room) => {
          setRefreshKey((key) => key + 1);
          toast.success("Room created successfully.");
        }}
      />

      {/* Add Bed Modal */}
      <AddBedModal
        isOpen={isAddBedOpen}
        onClose={() => setIsAddBedOpen(false)}
        onBedCreated={async () => {
          setIsAddBedOpen(false);
          setRefreshKey((key) => key + 1);
          toast.success("Bed created successfully.");
        }}
      />

      <AddTenantModal
        isOpen={addTenantState.isOpen}
        preselectedBed={addTenantState.preselectedBed}
        onClose={() =>
          setAddTenantState({
            isOpen: false,
            preselectedBed: null,
          })
        }
        onTenantCreated={async () => {
          setAddTenantState({
            isOpen: false,
            preselectedBed: null,
          });

          setRefreshKey((key) => key + 1);

          await refreshModalData();

          toast.success("Tenant created successfully.");
        }}
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
