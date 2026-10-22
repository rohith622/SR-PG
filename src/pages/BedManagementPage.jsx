import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { RoomCard } from '../components/rooms/RoomCard';
import { BedGrid } from '../components/beds/BedGrid';
import { BedDetailsPanel } from '../components/beds/BedDetailsPanel';
import { TransferBedModal } from '../components/beds/TransferBedModal';
import { CheckoutModal } from '../components/tenants/CheckoutModal';
import { RecordPaymentModal } from '../components/tenants/RecordPaymentModal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';
import roomService from '../services/roomService';
import bedService from '../services/bedService';
import tenantService from '../services/tenantService';
import {
  DoorClosed,
  Plus,
  Search,
  RefreshCw,
  X,
} from 'lucide-react';

export const BedManagementPage = ({
  onOpenAddRoom,
  onOpenAddBed,
  onOpenAddTenant,
  initialSelectedRoomId = null,
}) => {
  const toast = useToast();

  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, VACANT, PARTIAL, FULL

  // Modals state
  const [detailsBed, setDetailsBed] = useState(null);
  const [checkoutTenant, setCheckoutTenant] = useState(null);
  const [transferState, setTransferState] = useState({ isOpen: false, tenant: null, bed: null });
  const [paymentTenant, setPaymentTenant] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [roomsRes, bedsRes, tenantsRes] = await Promise.all([
        roomService.getRooms(),
        bedService.getAllBeds(),
        tenantService.getActiveTenants(),
      ]);

      const loadedRooms = roomsRes.data || [];
      const loadedBeds = bedsRes.data || [];
      const loadedTenants = tenantsRes.data || [];

      setRooms(loadedRooms);
      setBeds(loadedBeds);
      setTenants(loadedTenants);

      // Restore selected room
      if (initialSelectedRoomId) {
        const found = loadedRooms.find((r) => r.id === initialSelectedRoomId);
        if (found) setSelectedRoom(found);
      } else if (!selectedRoom && loadedRooms.length > 0) {
        setSelectedRoom(loadedRooms[0]);
      } else if (selectedRoom) {
        const refreshed = loadedRooms.find((r) => r.id === selectedRoom.id);
        if (refreshed) setSelectedRoom(refreshed);
      }
    } catch (err) {
      console.error('Error fetching bed management data:', err);
      toast.error('Failed to load room and bed data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update selected room when initialSelectedRoomId changes from outside
  useEffect(() => {
    if (initialSelectedRoomId && rooms.length > 0) {
      const found = rooms.find((r) => r.id === initialSelectedRoomId);
      if (found) setSelectedRoom(found);
    }
  }, [initialSelectedRoomId, rooms]);

  // Filtering rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      r.floor.toLowerCase().includes(searchQuery.toLowerCase().trim());

    const matchesFloor = floorFilter === 'ALL' || r.floor === floorFilter;

    let matchesStatus = true;
    if (statusFilter === 'VACANT') {
      matchesStatus = r.occupancyStatus === 'Vacant';
    } else if (statusFilter === 'PARTIAL') {
      matchesStatus = r.occupancyStatus === 'Partial';
    } else if (statusFilter === 'FULL') {
      matchesStatus = r.occupancyStatus === 'Full';
    } else if (statusFilter === 'HAS_AVAILABLE') {
      matchesStatus = (r.availableBeds || 0) > 0;
    }

    return matchesSearch && matchesFloor && matchesStatus;
  });

  // Extract unique floors for filter
  const uniqueFloors = Array.from(new Set(rooms.map((r) => r.floor)));

  // Available beds across PG for transfer modal
  const availableBedsAcrossPG = beds.filter((b) => b.status === 'Available');

  // Bed Actions Handlers
  const handleToggleMaintenance = async (bed, newStatus) => {
    try {
      const res = await bedService.updateBedStatus(bed.id, newStatus);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`${bed.bedNumber} marked as ${newStatus}.`);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update bed status.');
    }
  };

  const handleOpenBedDetails = (bed) => {
    setDetailsBed(bed);
  };

  const handleOpenCheckout = (bedOrTenant) => {
    // If bed passed, find tenant
    const t = bedOrTenant.tenantId
      ? tenants.find((item) => item.id === bedOrTenant.tenantId)
      : bedOrTenant;

    const b = bedOrTenant.bedNumber ? bedOrTenant : beds.find((item) => item.id === t?.bedId);

    setDetailsBed(null);
    setCheckoutTenant({ tenant: t, bed: b });
  };

  const handleOpenTransfer = (tenant, bed) => {
    setDetailsBed(null);
    setTransferState({ isOpen: true, tenant, bed });
  };

  const handleOpenRecordPayment = (tenant) => {
    setDetailsBed(null);
    setPaymentTenant(tenant);
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Contextual Breadcrumbs */}
      <PageHeader
        title="Bed Management & Occupancy"
        subtitle="Manage rooms, allocate beds to tenants, and monitor occupancy health."
        breadcrumbs={[
          { label: 'Home' },
          { label: 'Bed Management' },
          ...(selectedRoom ? [{ label: `Room ${selectedRoom.roomNumber}` }] : []),
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={loadData}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => onOpenAddBed(selectedRoom)}
            >
              Add Bed
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={onOpenAddRoom}
            >
              Add Room
            </Button>
          </div>
        }
      />

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            icon={Search}
            placeholder="Search room number (e.g. 101, 202)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Floors' },
              ...uniqueFloors.map((f) => ({ value: f, label: f })),
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Occupancy Statuses' },
              { value: 'HAS_AVAILABLE', label: 'With Available Beds' },
              { value: 'VACANT', label: 'Completely Vacant' },
              { value: 'PARTIAL', label: 'Partially Occupied' },
              { value: 'FULL', label: 'Full Capacity' },
            ]}
          />
        </div>

        {(searchQuery || floorFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">
              Found <span className="font-bold text-slate-800">{filteredRooms.length}</span> matching rooms
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFloorFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700"
            >
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout: Room Cards List (Top or Side) + Selected Room Bed Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-600">
            Loading room occupancy and bed grids...
          </p>
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={DoorClosed}
          title="No rooms created yet"
          description="Create your first room to begin adding beds and managing occupants."
          actionLabel="Add Room"
          actionIcon={Plus}
          onAction={onOpenAddRoom}
        />
      ) : (
        <div className="space-y-6">
          {/* Room Cards Horizontal Scroll / Responsive Grid */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <DoorClosed className="w-4 h-4 text-blue-600" />
                Select Room ({filteredRooms.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Click a room to inspect its individual beds
              </span>
            </div>

            {filteredRooms.length === 0 ? (
              <div className="p-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                No rooms match the applied search and filter criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isSelected={selectedRoom?.id === room.id}
                    onSelectRoom={(r) => setSelectedRoom(r)}
                    onAddBed={() => onOpenAddBed(room)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bed Grid for the currently selected room */}
          <div className="pt-2">
            <BedGrid
              room={selectedRoom}
              beds={beds}
              onAddBed={onOpenAddBed}
              onAssignTenant={(bed) => onOpenAddTenant(bed)}
              onViewBedDetails={handleOpenBedDetails}
              onToggleMaintenance={handleToggleMaintenance}
              onCheckout={handleOpenCheckout}
              onTransfer={(bed) => {
                const t = tenants.find((item) => item.id === bed.tenantId);
                handleOpenTransfer(t, bed);
              }}
            />
          </div>
        </div>
      )}

      {/* Bed Details Slide-over / Modal */}
      {detailsBed && (
        <BedDetailsPanel
          isOpen={Boolean(detailsBed)}
          onClose={() => setDetailsBed(null)}
          bed={detailsBed}
          tenant={tenants.find((t) => t.id === detailsBed.tenantId)}
          onCheckout={() => handleOpenCheckout(detailsBed)}
          onTransfer={(tenant, bed) => handleOpenTransfer(tenant, bed)}
          onRecordPayment={(tenant) => handleOpenRecordPayment(tenant)}
        />
      )}

      {/* Transfer Bed Modal */}
      {transferState.isOpen && (
        <TransferBedModal
          isOpen={transferState.isOpen}
          onClose={() => setTransferState({ isOpen: false, tenant: null, bed: null })}
          tenant={transferState.tenant}
          currentBed={transferState.bed}
          availableBeds={availableBedsAcrossPG.filter(
            (b) => b.id !== transferState.bed?.id
          )}
          onTransferred={() => {
            loadData();
          }}
        />
      )}

      {/* Checkout Modal */}
      {checkoutTenant && (
        <CheckoutModal
          isOpen={Boolean(checkoutTenant)}
          onClose={() => setCheckoutTenant(null)}
          tenant={checkoutTenant.tenant}
          bed={checkoutTenant.bed}
          onCheckoutComplete={() => {
            loadData();
          }}
        />
      )}

      {/* Record Rent Payment Modal */}
      {paymentTenant && (
        <RecordPaymentModal
          isOpen={Boolean(paymentTenant)}
          onClose={() => setPaymentTenant(null)}
          tenant={paymentTenant}
          onPaymentRecorded={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default BedManagementPage;
