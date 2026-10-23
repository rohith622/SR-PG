
import React, { useMemo, useState } from 'react';
import {
  ChevronRight,
  Search,
  Download,
  Users,
  UserRoundCheck,
  LogOut,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  MoreVertical,
  X,
  Phone,
  BedDouble,
  Building2,
  RotateCcw,
  Eye,
} from 'lucide-react';

const INITIAL_TENANTS = [
  {
    id: 1,
    name: 'Rahul Kumar',
    phone: '9876543210',
    room: '101',
    bed: 'B1',
    floor: '1st Floor',
    checkIn: '2026-05-12',
    checkOut: '',
    rent: 6000,
  },
  {
    id: 2,
    name: 'Priya Sharma',
    phone: '9876543211',
    room: '102',
    bed: 'B2',
    floor: '1st Floor',
    checkIn: '2026-06-03',
    checkOut: '',
    rent: 6500,
  },
  {
    id: 3,
    name: 'Amit Singh',
    phone: '9123456789',
    room: '201',
    bed: 'B1',
    floor: '2nd Floor',
    checkIn: '2026-01-15',
    checkOut: '2026-05-28',
    rent: 6000,
  },
  {
    id: 4,
    name: 'Neha Patel',
    phone: '9988776655',
    room: '201',
    bed: 'B2',
    floor: '2nd Floor',
    checkIn: '2026-07-20',
    checkOut: '',
    rent: 6000,
  },
  {
    id: 5,
    name: 'Vikram Reddy',
    phone: '8899775531',
    room: '301',
    bed: 'B1',
    floor: '3rd Floor',
    checkIn: '2026-03-10',
    checkOut: '2026-06-12',
    rent: 7000,
  },
  {
    id: 6,
    name: 'Sneha Kulkarni',
    phone: '7766554433',
    room: '301',
    bed: 'B2',
    floor: '3rd Floor',
    checkIn: '2026-08-05',
    checkOut: '',
    rent: 6500,
  },
  {
    id: 7,
    name: 'Manoj Jain',
    phone: '9988122334',
    room: '401',
    bed: 'B1',
    floor: '4th Floor',
    checkIn: '2026-03-18',
    checkOut: '2026-06-20',
    rent: 6000,
  },
  {
    id: 8,
    name: 'Kavya Tiwari',
    phone: '8877655443',
    room: '401',
    bed: 'B2',
    floor: '4th Floor',
    checkIn: '2026-09-22',
    checkOut: '',
    rent: 7000,
  },
  {
    id: 9,
    name: 'Arjun Rao',
    phone: '9876501234',
    room: '103',
    bed: 'B1',
    floor: '1st Floor',
    checkIn: '2026-02-10',
    checkOut: '2026-04-10',
    rent: 5500,
  },
  {
    id: 10,
    name: 'Sandeep Kumar',
    phone: '9876501235',
    room: '202',
    bed: 'B3',
    floor: '2nd Floor',
    checkIn: '2026-10-01',
    checkOut: '',
    rent: 6000,
  },
  {
    id: 11,
    name: 'Ananya Reddy',
    phone: '9876501236',
    room: '104',
    bed: 'B1',
    floor: '1st Floor',
    checkIn: '2026-04-01',
    checkOut: '2026-07-01',
    rent: 6500,
  },
  {
    id: 12,
    name: 'Kiran Kumar',
    phone: '9876501237',
    room: '302',
    bed: 'B2',
    floor: '3rd Floor',
    checkIn: '2026-09-15',
    checkOut: '',
    rent: 6000,
  },
];

const PAGE_SIZE = 8;

const formatDate = (date) => {
  if (!date) return '—';

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getDuration = (checkIn, checkOut) => {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = checkOut
    ? new Date(`${checkOut}T00:00:00`)
    : new Date();

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    end.getMonth() -
    start.getMonth();

  if (months <= 0) {
    const days = Math.max(
      1,
      Math.floor((end - start) / (1000 * 60 * 60 * 24))
    );

    return `${days} day${days === 1 ? '' : 's'}`;
  }

  return `${months} month${months === 1 ? '' : 's'}`;
};

const getInitials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-800',
  'bg-violet-100 text-violet-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
  'bg-sky-100 text-sky-700',
];

function Avatar({ name, index }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        AVATAR_COLORS[index % AVATAR_COLORS.length]
      }`}
    >
      {getInitials(name)}
    </div>
  );
}

function StatusBadge({ checkedOut }) {
  return checkedOut ? (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 sm:text-xs">
      Checked Out
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 sm:text-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Current
    </span>
  );
}

function SummaryCard({ title, value, icon: Icon, theme, subtitle }) {
  const themes = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    slate: 'bg-slate-100 text-slate-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${
          themes[theme]
        }`}
      >
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[10px] font-medium text-slate-500 sm:text-xs">
          {title}
        </p>
        <p className="mt-1 text-lg font-bold leading-tight text-slate-900 sm:text-2xl">
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 hidden text-[10px] text-slate-400 sm:block">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function TenantDetailsModal({ tenant, onClose }) {
  if (!tenant) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="tenant-details-title"
        className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-emerald-800">
              TENANT DETAILS
            </p>
            <h2
              id="tenant-details-title"
              className="mt-1 text-lg font-bold text-slate-900"
            >
              {tenant.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close tenant details"
            className="rounded-md p-1.5 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <Phone size={17} className="text-emerald-800" />
            <div>
              <p className="text-[10px] text-slate-500">Mobile number</p>
              <a
                href={`tel:${tenant.phone}`}
                className="text-sm font-semibold text-slate-800"
              >
                {tenant.phone}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <Building2 size={17} className="text-emerald-800" />
            <div>
              <p className="text-[10px] text-slate-500">Room and bed</p>
              <p className="text-sm font-semibold text-slate-800">
                Room {tenant.room} · Bed {tenant.bed}
              </p>
              <p className="text-xs text-slate-500">{tenant.floor}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <CalendarDays size={17} className="text-emerald-800" />
            <div>
              <p className="text-[10px] text-slate-500">Stay period</p>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(tenant.checkIn)} — {formatDate(tenant.checkOut)}
              </p>
              <p className="text-xs text-slate-500">
                {getDuration(tenant.checkIn, tenant.checkOut)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <span className="text-xs text-slate-500">Monthly rent</span>
            <span className="text-sm font-bold text-slate-900">
              ₹{tenant.rent.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Tenant status</span>
            <StatusBadge checkedOut={Boolean(tenant.checkOut)} />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Close Details
        </button>
      </section>
    </div>
  );
}

export function TenantHistoryPage() {
  const [tenants] = useState(INITIAL_TENANTS);
  const [search, setSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const floors = useMemo(
    () => [...new Set(tenants.map((tenant) => tenant.floor))],
    [tenants]
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentTenants = tenants.filter((tenant) => !tenant.checkOut);
  const checkedOutTenants = tenants.filter((tenant) => tenant.checkOut);

  const thisMonthCheckouts = checkedOutTenants.filter((tenant) => {
    const date = new Date(`${tenant.checkOut}T00:00:00`);
    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  const filteredTenants = useMemo(() => {
    let result = tenants.filter((tenant) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        tenant.name.toLowerCase().includes(query) ||
        tenant.phone.includes(query) ||
        tenant.room.toLowerCase().includes(query) ||
        tenant.bed.toLowerCase().includes(query);

      const matchesFloor =
        floorFilter === 'all' || tenant.floor === floorFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'current' && !tenant.checkOut) ||
        (statusFilter === 'checkedOut' && Boolean(tenant.checkOut));

      let matchesDate = true;

      if (dateFilter !== 'all') {
        const date = new Date(`${tenant.checkIn}T00:00:00`);
        const now = new Date();

        if (dateFilter === '30days') {
          const start = new Date();
          start.setDate(now.getDate() - 30);
          matchesDate = date >= start && date <= now;
        } else if (dateFilter === '90days') {
          const start = new Date();
          start.setDate(now.getDate() - 90);
          matchesDate = date >= start && date <= now;
        } else if (dateFilter === 'thisYear') {
          matchesDate = date.getFullYear() === now.getFullYear();
        }
      }

      return matchesSearch && matchesFloor && matchesStatus && matchesDate;
    });

    result.sort((a, b) => {
      if (sortOrder === 'oldest') {
        return a.checkIn.localeCompare(b.checkIn);
      }

      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name);
      }

      return b.checkIn.localeCompare(a.checkIn);
    });

    return result;
  }, [tenants, search, floorFilter, statusFilter, dateFilter, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTenants.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const pageTenants = filteredTenants.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const resetFilters = () => {
    setSearch('');
    setFloorFilter('all');
    setStatusFilter('all');
    setDateFilter('all');
    setSortOrder('latest');
    setCurrentPage(1);
    setOpenMenuId(null);
  };

  const exportCSV = () => {
    const headers = [
      'Tenant Name',
      'Phone',
      'Room',
      'Bed',
      'Floor',
      'Check-in Date',
      'Check-out Date',
      'Duration',
      'Monthly Rent',
      'Status',
    ];

    const rows = filteredTenants.map((tenant) => [
      tenant.name,
      tenant.phone,
      tenant.room,
      tenant.bed,
      tenant.floor,
      tenant.checkIn,
      tenant.checkOut || '',
      getDuration(tenant.checkIn, tenant.checkOut),
      tenant.rent,
      tenant.checkOut ? 'Checked Out' : 'Current',
    ]);

    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'sr-pg-tenant-history.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const changePage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setOpenMenuId(null);
  };

  return (
    <div className="min-h-full min-w-0 bg-[#F5F7F6] text-slate-900">
      {/* Page header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 sm:text-xs">
              <span>Dashboard</span>
              <ChevronRight size={13} />
              <span className="font-semibold text-emerald-800">
                Tenant History
              </span>
            </div>

            <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Tenant History
            </h1>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              View past and present tenant check-in and check-out records.
            </p>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-900 sm:w-auto sm:text-sm"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] space-y-4 p-3 sm:space-y-5 sm:p-5 lg:p-8">
        {/* Search and filters */}
        <section className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(130px,0.7fr)_minmax(130px,0.7fr)_minmax(150px,0.8fr)_auto]">
            <div className="relative min-w-0">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, phone, room or bed..."
                aria-label="Search tenant history"
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-emerald-600 sm:text-sm"
              />
            </div>

            <div className="relative">
              <select
                value={floorFilter}
                onChange={(event) => {
                  setFloorFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by floor"
                className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-xs outline-none focus:border-emerald-600 sm:text-sm"
              >
                <option value="all">All Floors</option>
                {floors.map((floor) => (
                  <option key={floor} value={floor}>
                    {floor}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by tenant status"
                className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-xs outline-none focus:border-emerald-600 sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="current">Currently Staying</option>
                <option value="checkedOut">Checked Out</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={dateFilter}
                onChange={(event) => {
                  setDateFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by check-in date"
                className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-xs outline-none focus:border-emerald-600 sm:text-sm"
              >
                <option value="all">Any Check-in Date</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="thisYear">This Year</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-emerald-900 px-4 text-xs font-semibold text-white sm:text-sm"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </section>

        {/* Summary cards */}
        <section className="grid grid-cols-2 gap-2.5 xl:grid-cols-4 sm:gap-3">
          <SummaryCard
            title="Total Tenants"
            value={tenants.length}
            icon={Users}
            theme="emerald"
            subtitle="All recorded tenants"
          />

          <SummaryCard
            title="Currently Staying"
            value={currentTenants.length}
            icon={UserRoundCheck}
            theme="blue"
            subtitle="Active stays"
          />

          <SummaryCard
            title="Checked Out"
            value={checkedOutTenants.length}
            icon={LogOut}
            theme="slate"
            subtitle="Completed stays"
          />

          <SummaryCard
            title="This Month Checkouts"
            value={thisMonthCheckouts.length}
            icon={CalendarDays}
            theme="orange"
            subtitle="Checkouts this month"
          />
        </section>

        {/* Tenant records */}
        <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                Tenant Records
              </h2>
              <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                Complete check-in and check-out history.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="tenant-sort"
                className="shrink-0 text-[10px] text-slate-500 sm:text-xs"
              >
                Sort by
              </label>

              <select
                id="tenant-sort"
                value={sortOrder}
                onChange={(event) => {
                  setSortOrder(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-[11px] outline-none sm:flex-none sm:text-xs"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Tenant Name</option>
              </select>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-[11px] font-semibold text-slate-600">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Tenant Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Room / Bed</th>
                  <th className="px-4 py-3">Floor</th>
                  <th className="px-4 py-3">Check-in</th>
                  <th className="px-4 py-3">Check-out</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {pageTenants.map((tenant, index) => (
                  <tr
                    key={tenant.id}
                    className="text-xs text-slate-700"
                  >
                    <td className="px-4 py-3.5">
                      {(safePage - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={tenant.name} index={index} />
                        <span className="whitespace-nowrap font-semibold text-slate-800">
                          {tenant.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <a
                        href={`tel:${tenant.phone}`}
                        className="whitespace-nowrap text-slate-600"
                      >
                        {tenant.phone}
                      </a>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      {tenant.room} / {tenant.bed}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      {tenant.floor}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      {formatDate(tenant.checkIn)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      {formatDate(tenant.checkOut)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      {getDuration(tenant.checkIn, tenant.checkOut)}
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge checkedOut={Boolean(tenant.checkOut)} />
                    </td>

                    <td className="relative px-4 py-3.5 text-right">
                      <button
                        type="button"
                        aria-label={`Actions for ${tenant.name}`}
                        aria-expanded={openMenuId === tenant.id}
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === tenant.id ? null : tenant.id
                          )
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenuId === tenant.id && (
                        <div className="absolute right-8 top-12 z-20 w-40 rounded-lg border border-slate-200 bg-white p-1.5 text-left shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-700"
                          >
                            <Eye size={14} />
                            View Details
                          </button>

                          <a
                            href={`tel:${tenant.phone}`}
                            onClick={() => setOpenMenuId(null)}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-700"
                          >
                            <Phone size={14} />
                            Call Tenant
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2.5 p-3 md:hidden">
            {pageTenants.map((tenant, index) => (
              <article
                key={tenant.id}
                className="rounded-lg border border-slate-200 p-3"
              >
                <div className="flex items-start gap-2.5">
                  <Avatar name={tenant.name} index={index} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="truncate text-xs font-bold text-slate-900">
                        {tenant.name}
                      </h3>
                      <StatusBadge checkedOut={Boolean(tenant.checkOut)} />
                    </div>

                    <a
                      href={`tel:${tenant.phone}`}
                      className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-500"
                    >
                      <Phone size={11} />
                      {tenant.phone}
                    </a>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[10px] text-slate-400">Room / Bed</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-700">
                      {tenant.room} / {tenant.bed}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {tenant.floor}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">Stay Duration</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-700">
                      {getDuration(tenant.checkIn, tenant.checkOut)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">Check-in</p>
                    <p className="mt-0.5 text-xs text-slate-700">
                      {formatDate(tenant.checkIn)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">Check-out</p>
                    <p className="mt-0.5 text-xs text-slate-700">
                      {formatDate(tenant.checkOut)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <span className="text-[10px] text-slate-500">
                    Rent: ₹{tenant.rent.toLocaleString('en-IN')}/month
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedTenant(tenant)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-900"
                  >
                    <Eye size={12} />
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Empty state */}
          {pageTenants.length === 0 && (
            <div className="px-4 py-12 text-center">
              <Users size={27} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-800">
                No tenant records found
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try changing your search or filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-xs font-semibold text-emerald-800"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <p className="text-[10px] text-slate-500 sm:text-xs">
              {filteredTenants.length === 0
                ? 'Showing 0 records'
                : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                    safePage * PAGE_SIZE,
                    filteredTenants.length
                  )} of ${filteredTenants.length} records`}
            </p>

            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => changePage(safePage - 1)}
                disabled={safePage === 1}
                aria-label="Previous page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - safePage) <= 1
                )
                .map((page, index, visiblePages) => (
                  <React.Fragment key={page}>
                    {index > 0 &&
                      page - visiblePages[index - 1] > 1 && (
                        <span className="px-1 text-xs text-slate-400">
                          …
                        </span>
                      )}

                    <button
                      type="button"
                      onClick={() => changePage(page)}
                      aria-current={safePage === page ? 'page' : undefined}
                      className={`h-8 min-w-8 rounded-md border px-2 text-xs font-medium ${
                        safePage === page
                          ? 'border-emerald-900 bg-emerald-900 text-white'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}

              <button
                type="button"
                onClick={() => changePage(safePage + 1)}
                disabled={safePage === totalPages}
                aria-label="Next page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between gap-2 py-1 text-[10px] text-slate-400 sm:text-xs">
          <span>SR PG · Tenant History</span>
          <span>Tenant records and stay details</span>
        </footer>
      </main>

      <TenantDetailsModal
        tenant={selectedTenant}
        onClose={() => setSelectedTenant(null)}
      />
    </div>
  );
}

export default TenantHistoryPage;
