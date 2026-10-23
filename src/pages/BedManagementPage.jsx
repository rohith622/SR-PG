import React, { useMemo, useState } from 'react';
import {
  BedDouble,
  Building2,
  Users,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  Plus,
  Phone,
  CalendarDays,
  CheckCircle2,
  Wrench,
  LayoutGrid,
  UserRound,
  ArrowUpRight,
} from 'lucide-react';

const FLOORS = ['All Floors', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];

const INITIAL_ROOMS = [
  {
    id: '101',
    floor: '1st Floor',
    beds: [
      { id: 1, status: 'available', tenant: null },
      {
        id: 2,
        status: 'occupied',
        tenant: {
          name: 'Rahul Kumar',
          phone: '9876543210',
          joined: '12 Oct 2026',
        },
      },
      {
        id: 3,
        status: 'occupied',
        tenant: {
          name: 'Arun Sharma',
          phone: '9876543211',
          joined: '10 Oct 2026',
        },
      },
      {
        id: 4,
        status: 'occupied',
        tenant: {
          name: 'Suresh Kumar',
          phone: '9876543212',
          joined: '05 Oct 2026',
        },
      },
    ],
  },
  {
    id: '102',
    floor: '1st Floor',
    beds: [
      { id: 1, status: 'occupied', tenant: { name: 'Kiran Rao', phone: '9876543213', joined: '01 Oct 2026' } },
      { id: 2, status: 'occupied', tenant: { name: 'Vijay Kumar', phone: '9876543214', joined: '02 Oct 2026' } },
      { id: 3, status: 'occupied', tenant: { name: 'Ravi Teja', phone: '9876543215', joined: '04 Oct 2026' } },
      { id: 4, status: 'occupied', tenant: { name: 'Ajay Reddy', phone: '9876543216', joined: '06 Oct 2026' } },
    ],
  },
  {
    id: '103',
    floor: '1st Floor',
    beds: [
      { id: 1, status: 'occupied', tenant: { name: 'Manoj Kumar', phone: '9876543217', joined: '03 Oct 2026' } },
      { id: 2, status: 'occupied', tenant: { name: 'Naveen Rao', phone: '9876543218', joined: '08 Oct 2026' } },
      { id: 3, status: 'available', tenant: null },
      { id: 4, status: 'available', tenant: null },
    ],
  },
  {
    id: '104',
    floor: '1st Floor',
    beds: [
      { id: 1, status: 'occupied', tenant: { name: 'Sai Kumar', phone: '9876543219', joined: '07 Oct 2026' } },
      { id: 2, status: 'available', tenant: null },
      { id: 3, status: 'available', tenant: null },
      { id: 4, status: 'available', tenant: null },
    ],
  },
  {
    id: '105',
    floor: '1st Floor',
    beds: [
      { id: 1, status: 'occupied', tenant: { name: 'Ramesh Babu', phone: '9876543220', joined: '09 Oct 2026' } },
      { id: 2, status: 'occupied', tenant: { name: 'Hari Krishna', phone: '9876543221', joined: '11 Oct 2026' } },
      { id: 3, status: 'occupied', tenant: { name: 'Vamsi Krishna', phone: '9876543222', joined: '13 Oct 2026' } },
      { id: 4, status: 'available', tenant: null },
    ],
  },
  {
    id: '106',
    floor: '1st Floor',
    beds: [
      { id: 1, status: 'available', tenant: null },
      { id: 2, status: 'available', tenant: null },
      { id: 3, status: 'available', tenant: null },
      { id: 4, status: 'available', tenant: null },
    ],
  },
  {
    id: '107',
    floor: '1st Floor',
    beds: [
      { id: 1, status: 'occupied', tenant: { name: 'Praveen Kumar', phone: '9876543223', joined: '14 Oct 2026' } },
      { id: 2, status: 'occupied', tenant: { name: 'Sandeep Rao', phone: '9876543224', joined: '15 Oct 2026' } },
      { id: 3, status: 'available', tenant: null },
      { id: 4, status: 'available', tenant: null },
    ],
  },
  {
    id: '108',
    floor: '1st Floor',
    beds: [
      { id: 1, status: 'occupied', tenant: { name: 'Anil Kumar', phone: '9876543225', joined: '16 Oct 2026' } },
      { id: 2, status: 'occupied', tenant: { name: 'Srinivas', phone: '9876543226', joined: '17 Oct 2026' } },
      { id: 3, status: 'occupied', tenant: { name: 'Mahesh Babu', phone: '9876543227', joined: '18 Oct 2026' } },
      { id: 4, status: 'occupied', tenant: { name: 'Tarun Kumar', phone: '9876543228', joined: '19 Oct 2026' } },
    ],
  },
  {
    id: '201',
    floor: '2nd Floor',
    beds: [
      { id: 1, status: 'occupied', tenant: { name: 'Pavan Kumar', phone: '9876543229', joined: '02 Oct 2026' } },
      { id: 2, status: 'available', tenant: null },
      { id: 3, status: 'occupied', tenant: { name: 'Lokesh', phone: '9876543230', joined: '04 Oct 2026' } },
      { id: 4, status: 'available', tenant: null },
    ],
  },
  {
    id: '202',
    floor: '2nd Floor',
    beds: [
      { id: 1, status: 'available', tenant: null },
      { id: 2, status: 'available', tenant: null },
      { id: 3, status: 'available', tenant: null },
      { id: 4, status: 'available', tenant: null },
    ],
  },
  {
    id: '301',
    floor: '3rd Floor',
    beds: [
      { id: 1, status: 'occupied', tenant: { name: 'Chandu', phone: '9876543231', joined: '01 Oct 2026' } },
      { id: 2, status: 'occupied', tenant: { name: 'Mohan', phone: '9876543232', joined: '02 Oct 2026' } },
      { id: 3, status: 'available', tenant: null },
      { id: 4, status: 'available', tenant: null },
    ],
  },
  {
    id: '401',
    floor: '4th Floor',
    beds: [
      { id: 1, status: 'maintenance', tenant: null },
      { id: 2, status: 'available', tenant: null },
      { id: 3, status: 'available', tenant: null },
      { id: 4, status: 'available', tenant: null },
    ],
  },
];

const STATUS = {
  occupied: {
    label: 'Occupied',
    dot: 'bg-blue-500',
    text: 'text-blue-700',
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
    bed: 'text-blue-600',
    card: 'border-blue-200 bg-blue-50/40',
  },
  available: {
    label: 'Available',
    dot: 'bg-emerald-600',
    text: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    bed: 'text-emerald-600',
    card: 'border-emerald-200 bg-emerald-50/40',
  },
  maintenance: {
    label: 'Maintenance',
    dot: 'bg-orange-500',
    text: 'text-orange-700',
    badge: 'bg-orange-50 text-orange-700 border-orange-100',
    bed: 'text-orange-500',
    card: 'border-orange-200 bg-orange-50/40',
  },
};

function getCounts(rooms) {
  const beds = rooms.flatMap((room) => room.beds);

  return {
    rooms: rooms.length,
    beds: beds.length,
    occupied: beds.filter((bed) => bed.status === 'occupied').length,
    available: beds.filter((bed) => bed.status === 'available').length,
    maintenance: beds.filter((bed) => bed.status === 'maintenance').length,
  };
}

function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function BedIcon({ status, size = 20 }) {
  return (
    <BedDouble
      size={size}
      strokeWidth={2}
      className={STATUS[status]?.bed || 'text-slate-400'}
    />
  );
}

function StatusBadge({ status }) {
  const config = STATUS[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function RoomCard({ room, selected, onClick }) {
  const counts = getCounts([room]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 rounded-md border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
        selected
          ? 'border-blue-500 bg-white ring-1 ring-blue-500'
          : counts.available === 0 && counts.maintenance === 0
            ? 'border-rose-200 bg-rose-50/80'
            : counts.available === counts.beds
              ? 'border-emerald-200 bg-emerald-50/50'
              : 'border-slate-200 bg-white hover:border-emerald-300'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm font-bold ${counts.available === 0 && counts.maintenance === 0 ? 'text-rose-700' : 'text-slate-900'}`}>
          {room.id}
        </span>
        <ChevronRight size={16} className="text-slate-400" />
      </div>

      <p className={`mt-1 text-sm font-semibold ${counts.available === 0 && counts.maintenance === 0 ? 'text-rose-600' : 'text-blue-700'}`}>
        {counts.occupied + counts.maintenance} / {counts.beds}
        <span className="ml-1 text-xs font-normal text-slate-400">filled</span>
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {room.beds.map((bed) => (
          <BedIcon key={bed.id} status={bed.status} size={19} />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-1 text-[10px] text-slate-500">
        <span>{counts.available} available</span>
        {counts.maintenance > 0 && (
          <span className="text-orange-600">{counts.maintenance} repair</span>
        )}
      </div>
    </button>
  );
}

function TenantInitials({ name }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-blue-900 text-xs font-bold text-white">
      {initials}
    </div>
  );
}

function AddTenantModal({ room, bed, onClose, onSave }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [joined, setJoined] = useState('2026-10-23');
  const [error, setError] = useState('');

  if (!room || !bed) return null;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError('Enter the tenant name.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    onSave({
      name: name.trim(),
      phone,
      joined: new Date(`${joined}T00:00:00`).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-tenant-title"
        className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 id="add-tenant-title" className="text-lg font-bold text-slate-900">
              Add Tenant
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Room {room.id} · Bed {bed.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="tenant-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Tenant name
            </label>
            <input
              id="tenant-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter full name"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="tenant-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
              Mobile number
            </label>
            <input
              id="tenant-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              required
            />
          </div>

          <div>
            <label htmlFor="tenant-joined" className="mb-1.5 block text-sm font-medium text-slate-700">
              Joining date
            </label>
            <input
              id="tenant-joined"
              type="date"
              value={joined}
              onChange={(event) => setJoined(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              required
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Add Tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BedManagement() {
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [selectedFloor, setSelectedFloor] = useState('1st Floor');
  const [selectedRoomId, setSelectedRoomId] = useState('101');
  const [search, setSearch] = useState('');
  const [tenantModal, setTenantModal] = useState(null);
  const [bedFilter, setBedFilter] = useState('all');
  const [showRoomDetails, setShowRoomDetails] = useState(true);

  const allCounts = getCounts(rooms);

  const visibleRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesFloor =
        selectedFloor === 'All Floors' || room.floor === selectedFloor;

      const matchesSearch =
        room.id.toLowerCase().includes(search.toLowerCase()) ||
        room.beds.some((bed) =>
          bed.tenant?.name.toLowerCase().includes(search.toLowerCase())
        );

      return matchesFloor && matchesSearch;
    });
  }, [rooms, selectedFloor, search]);

  const selectedRoom =
    rooms.find((room) => room.id === selectedRoomId) || null;

  const selectedRoomCounts = selectedRoom ? getCounts([selectedRoom]) : null;

  const roomSections =
    selectedFloor === 'All Floors'
      ? FLOORS.filter((floor) => floor !== 'All Floors')
      : [selectedFloor];

  const handleFloorChange = (floor) => {
    setSelectedFloor(floor);

    const firstRoom = rooms.find(
      (room) => floor === 'All Floors' || room.floor === floor
    );

    if (firstRoom) setSelectedRoomId(firstRoom.id);
  };

  const handleAddTenant = (tenant) => {
    if (!tenantModal) return;

    setRooms((currentRooms) =>
      currentRooms.map((room) =>
        room.id !== tenantModal.roomId
          ? room
          : {
              ...room,
              beds: room.beds.map((bed) =>
                bed.id !== tenantModal.bedId
                  ? bed
                  : { ...bed, status: 'occupied', tenant }
              ),
            }
      )
    );

    setSelectedRoomId(tenantModal.roomId);
    setTenantModal(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F6] text-slate-900">
      {/* Page Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
  
<div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
  {/* Page title */}
  <div className="min-w-0">
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <span>Dashboard</span>
      <ChevronRight size={13} />
      <span className="font-semibold text-emerald-800">
        Bed Management
      </span>
    </div>

    <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
      Bed Management
    </h1>

    <p className="mt-1 text-sm text-slate-500">
      Manage floors, rooms and bed occupancy
    </p>
  </div>

  {/* Action buttons */}

{/* Action buttons */}
<div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
  <button
    type="button"
    // onClick={onOpenAddFloor}
    className="inline-flex min-h-9 items-center justify-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs font-semibold text-emerald-800 focus:outline-none sm:min-h-11 sm:gap-2 sm:rounded-lg sm:px-4 sm:text-sm"
  >
    <Building2 size={15} />
    <span>Add Floor</span>
  </button>

  <button
    type="button"
    // onClick={onOpenAddRoom}
    className="inline-flex min-h-9 items-center justify-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs font-semibold text-emerald-800 focus:outline-none sm:min-h-11 sm:gap-2 sm:rounded-lg sm:px-4 sm:text-sm"
  >
    <Plus size={15} />
    <span>Add Room</span>
  </button>

  <button
    type="button"
    // onClick={onOpenAddBed}
    className="inline-flex min-h-9 items-center justify-center gap-1 rounded-md bg-emerald-900 px-2 py-2 text-xs font-semibold text-white focus:outline-none sm:min-h-11 sm:gap-2 sm:rounded-lg sm:px-4 sm:text-sm"
  >
    <BedDouble size={15} />
    <span>Add Bed</span>
  </button>
</div>

</div>

      </header>

      <main className="mx-auto max-w-[1800px] space-y-5 p-4 sm:p-4 lg:p-4">
        {/* Floor Filters and Summary */}
       
<section className="space-y-3">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    {/* Floor label and buttons */}
    <div className="min-w-0">
      <span className="mb-2 block text-xs font-semibold text-slate-700 sm:text-sm">
        Floor
      </span>

      <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-1 sm:gap-2">
        {FLOORS.map((floor) => (
          <button
            type="button"
            key={floor}
            onClick={() => handleFloorChange(floor)}
            className={`shrink-0 rounded-md border px-3 py-2 text-[11px] font-semibold sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-xs ${
              selectedFloor === floor
                ? 'border-emerald-900 bg-emerald-900 text-white'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            {floor}
          </button>
        ))}
      </div>
    </div>

    {/* Bed status legend */}
    <div className="flex flex-wrap items-center justify-start gap-x-3 gap-y-1 sm:justify-end sm:pb-1">
      <span className="text-[10px] font-semibold text-slate-500 sm:text-xs">
        Bed Status
      </span>

      {Object.entries(STATUS).map(([key, value]) => (
        <span
          key={key}
          className="flex items-center gap-1 text-[10px] text-slate-500 sm:gap-1.5 sm:text-xs"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${value.dot}`}
          />
          {value.label}
        </span>
      ))}
    </div>
  </div>
</section>


        {/* Main Layout */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 2xl:grid-cols-[minmax(0,1.4fr)_minmax(380px,0.85fr)]">
          {/* Rooms by Floor */}
          <div className="min-w-0 space-y-4">
            {roomSections.map((floor) => {
              const floorRooms = visibleRooms.filter(
                (room) => room.floor === floor
              );

              if (!floorRooms.length) return null;

              const floorCounts = getCounts(floorRooms);

              return (
                <section
                  key={floor}
                  className="overflow-hidden rounded-md border border-slate-200 bg-white"
                >
                  <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-5 sm:px-5">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Rooms - {floor}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        {floorCounts.rooms} Rooms · {floorCounts.beds} Beds
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedFloor(
                          selectedFloor === floor ? 'All Floors' : floor
                        )
                      }
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-600"
                    >
                      View floor <ArrowUpRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 px-4 pb-5 sm:grid-cols-3 sm:px-5 xl:grid-cols-4">
                    {floorRooms.map((room) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        selected={room.id === selectedRoomId}
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setShowRoomDetails(true);
                          setBedFilter('all');
                        }}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {visibleRooms.length === 0 && (
              <div className="rounded-md border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                <Search className="mx-auto text-slate-400" size={28} />
                <p className="mt-3 font-semibold text-slate-800">No rooms found</p>
                <p className="mt-1 text-sm text-slate-500">
                  Try another room number, tenant name or floor.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    handleFloorChange('All Floors');
                  }}
                  className="mt-4 text-sm font-semibold text-emerald-800"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Selected Room Details */}
          {showRoomDetails && selectedRoom && (
          
<section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
  {/* Room summary */}
  <div className="border-b border-slate-100 p-3 sm:p-4">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-wide text-emerald-800 sm:text-xs">
          SELECTED ROOM
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
          Room {selectedRoom.id}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          {selectedRoom.floor} · {selectedRoom.beds.length} Beds
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowRoomDetails(false)}
        className="shrink-0 rounded-md p-1.5 text-slate-400"
        aria-label="Close room details"
      >
        <X size={17} />
      </button>
    </div>

    {/* Compact occupancy cards */}
    <div className="mt-3 grid grid-cols-3 gap-2">
      <div className="rounded-lg bg-blue-50 px-2.5 py-2">
        <p className="text-[10px] text-blue-700 sm:text-xs">Occupied</p>
        <p className="mt-0.5 text-lg font-bold text-blue-800">
          {selectedRoomCounts.occupied}
        </p>
      </div>

      <div className="rounded-lg bg-emerald-50 px-2.5 py-2">
        <p className="text-[10px] text-emerald-700 sm:text-xs">Available</p>
        <p className="mt-0.5 text-lg font-bold text-emerald-800">
          {selectedRoomCounts.available}
        </p>
      </div>

      <div className="rounded-lg bg-orange-50 px-2.5 py-2">
        <p className="text-[10px] text-orange-700 sm:text-xs">Maintenance</p>
        <p className="mt-0.5 text-lg font-bold text-orange-800">
          {selectedRoomCounts.maintenance}
        </p>
      </div>
    </div>

    {/* Occupancy bar */}
    <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-slate-100">
      {selectedRoom.beds.map((bed, index) => (
        <div
          key={bed.id}
          title={`Bed ${bed.id}: ${STATUS[bed.status].label}`}
          className={`h-full flex-1 ${
            bed.status === 'occupied'
              ? 'bg-blue-500'
              : bed.status === 'available'
                ? 'bg-emerald-500'
                : 'bg-orange-500'
          } ${index > 0 ? 'ml-0.5' : ''}`}
        />
      ))}
    </div>

    <p className="mt-1.5 text-[10px] text-slate-500 sm:text-xs">
      {selectedRoomCounts.occupied} of {selectedRoomCounts.beds} beds occupied
    </p>
  </div>

  {/* Bed details */}
  <div className="p-3 sm:p-4">
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-bold text-slate-900">Bed Details</h3>

      <select
        value={bedFilter}
        onChange={(event) => setBedFilter(event.target.value)}
        aria-label="Filter beds by status"
        className="max-w-[125px] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-600 outline-none sm:max-w-[145px] sm:text-xs"
      >
        <option value="all">All Beds</option>
        <option value="occupied">Occupied</option>
        <option value="available">Available</option>
        <option value="maintenance">Maintenance</option>
      </select>
    </div>

    <div className="mt-3 space-y-2">
      {selectedRoom.beds
        .filter((bed) => bedFilter === 'all' || bed.status === bedFilter)
        .map((bed) => (
          <div
            key={bed.id}
            className="rounded-lg border border-slate-200 p-2.5 sm:p-3"
          >
            <div className="flex items-start gap-2.5">
              {/* <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 sm:h-10 sm:w-10">
                <BedIcon status={bed.status} size={19} />
              </div> */}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <p className="text-xs font-bold text-slate-900 sm:text-sm">
                    Bed {bed.id}
                  </p>
                  <StatusBadge status={bed.status} />
                </div>

                {bed.tenant ? (
                  <div className="mt-2 flex items-center gap-2">
                    {/* <TenantInitials name={bed.tenant.name} /> */}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
                        {bed.tenant.name}
                      </p>

                      <a
                        href={`tel:${bed.tenant.phone}`}
                        className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-slate-500 sm:text-xs"
                      >
                        <Phone size={11} />
                        {bed.tenant.phone}
                      </a>

                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400 sm:text-[11px]">
                        <CalendarDays size={11} />
                        Joined: {bed.tenant.joined}
                      </p>
                    </div>

                    <a
                      href={`tel:${bed.tenant.phone}`}
                      aria-label={`Call ${bed.tenant.name}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-emerald-800"
                    >
                      <Phone size={14} />
                    </a>
                  </div>
                ) : bed.status === 'available' ? (
                  <div className="mt-1.5">
                    <p className="text-[10px] text-slate-500 sm:text-xs">
                      No tenant assigned
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setTenantModal({
                          roomId: selectedRoom.id,
                          bedId: bed.id,
                        })
                      }
                      className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-900 px-2.5 py-1.5 text-[10px] font-semibold text-white sm:text-xs"
                    >
                      <Plus size={12} />
                      Add Tenant
                    </button>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[10px] text-orange-700 sm:text-xs">
                    Bed unavailable during maintenance.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>

    {selectedRoomCounts.available > 0 && (
      <button
        type="button"
        onClick={() => {
          const availableBed = selectedRoom.beds.find(
            (bed) => bed.status === 'available'
          );

          if (availableBed) {
            setTenantModal({
              roomId: selectedRoom.id,
              bedId: availableBed.id,
            });
          }
        }}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-900 px-3 py-2.5 text-xs font-semibold text-white sm:text-sm"
      >
        <Plus size={15} />
        Add Tenant to Available Bed
      </button>
    )}
  </div>
</section>

          )}

          {!showRoomDetails && selectedRoom && (
            <button
              type="button"
              onClick={() => setShowRoomDetails(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white p-4 text-sm font-semibold text-emerald-900 shadow-sm hover:bg-emerald-50"
            >
              <LayoutGrid size={17} />
              Show Room {selectedRoom.id} Details
              <ChevronDown size={16} />
            </button>
          )}
        </div>

        <footer className="flex flex-col gap-2 border-t border-slate-200 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>SR PG · Bed Management</span>
          <span className="flex items-center gap-1.5">
            <UserRound size={13} />
            Occupancy shown using demo data
          </span>
        </footer>
      </main>

      {tenantModal && (
        <AddTenantModal
          room={rooms.find((room) => room.id === tenantModal.roomId)}
          bed={rooms
            .find((room) => room.id === tenantModal.roomId)
            ?.beds.find((bed) => bed.id === tenantModal.bedId)}
          onClose={() => setTenantModal(null)}
          onSave={handleAddTenant}
        />
      )}
    </div>
  );
}