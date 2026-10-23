import React, { useMemo, useState } from 'react';
import {
  Phone,
  IndianRupee,
  AlertCircle,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const DUMMY_RENT_DATA = [
  {
    id: 1,
    name: 'Rahul Kumar',
    phone: '9876543210',
    roomNumber: '102',
    amountDue: 6000,
    dueDate: '20 Oct 2026',
    status: 'OVERDUE',
  },
  {
    id: 2,
    name: 'Arun Kumar',
    phone: '9876543211',
    roomNumber: '104',
    amountDue: 6000,
    dueDate: '21 Oct 2026',
    status: 'OVERDUE',
  },
  {
    id: 3,
    name: 'Suresh Reddy',
    phone: '9876543212',
    roomNumber: '105',
    amountDue: 7500,
    dueDate: '23 Oct 2026',
    status: 'DUE TODAY',
  },
  {
    id: 4,
    name: 'Kiran Kumar',
    phone: '9876543213',
    roomNumber: '108',
    amountDue: 5500,
    dueDate: '25 Oct 2026',
    status: 'UPCOMING',
  },
  {
    id: 5,
    name: 'Praveen Rao',
    phone: '9876543214',
    roomNumber: '110',
    amountDue: 6500,
    dueDate: '26 Oct 2026',
    status: 'UPCOMING',
  },
];

export const OccupancyBar = () => {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTenants = useMemo(() => {
    if (statusFilter === 'ALL') return DUMMY_RENT_DATA;

    return DUMMY_RENT_DATA.filter(
      (tenant) => tenant.status === statusFilter
    );
  }, [statusFilter]);

  const totalPending = filteredTenants.reduce(
    (total, tenant) => total + tenant.amountDue,
    0
  );

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OVERDUE':
        return 'bg-rose-50 text-rose-700';

      case 'DUE TODAY':
        return 'bg-amber-50 text-amber-800';

      default:
        return 'bg-emerald-50 text-emerald-800';
    }
  };

  return (
    <section className="mb-6 overflow-hidden rounded-md border border-slate-200 bg-white">

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h3 className="text-base font-bold tracking-tight text-slate-900">
            Rent Due Management
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Track pending payments and contact tenants.
          </p>
        </div>

        {/* Filter + Total Pending */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-800" />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter tenants by rent status"
              className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 sm:w-40"
            >
              <option value="ALL">All Status</option>
              <option value="OVERDUE">Overdue</option>
              <option value="DUE TODAY">Due Today</option>
              <option value="UPCOMING">Upcoming</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-sm bg-emerald-950 px-3 py-1 text-white sm:flex-none">
            <IndianRupee className="h-4 w-4 shrink-0 text-emerald-300" />
            <div>
              <p className="text-[10px] text-emerald-200">
                Total Pending
              </p>
              <p className="text-sm font-bold">
                {formatCurrency(totalPending)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">Tenant</th>
              <th className="px-4 py-3.5">Room</th>
              <th className="px-4 py-3.5">Due Date</th>
              <th className="px-4 py-3.5">Amount Due</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredTenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="transition-colors hover:bg-emerald-50/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-xs font-bold text-emerald-200">
                      {tenant.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {tenant.name}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {tenant.phone}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-xs font-medium text-slate-700">
                  {tenant.roomNumber}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                  {tenant.dueDate}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-slate-900">
                  {formatCurrency(tenant.amountDue)}
                </td>

                <td className="px-4 py-4">
                  <StatusBadge
                    status={tenant.status}
                    getStatusStyle={getStatusStyle}
                  />
                </td>

                <td className="px-5 py-4 text-right">
                  <CallButton
                    tenant={tenant}
                    onCall={handleCall}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="divide-y divide-slate-100 md:hidden">
        {filteredTenants.map((tenant) => (
          <div key={tenant.id} className="px-2 py-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-xs font-bold text-emerald-200">
                  {tenant.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {tenant.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Room {tenant.roomNumber} · {tenant.phone}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-extrabold text-slate-900">
                  {formatCurrency(tenant.amountDue)}
                </p>
                <div className="mt-1">
                  <StatusBadge
                    status={tenant.status}
                    getStatusStyle={getStatusStyle}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <p className="text-[11px] text-slate-500">
                Due: {tenant.dueDate}
              </p>

              <CallButton
                tenant={tenant}
                onCall={handleCall}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTenants.length === 0 && (
        <div className="px-4 py-12 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No tenants found
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Try selecting another rent status.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-5">
        <p className="text-[11px] text-slate-500">
          Showing {filteredTenants.length} of {DUMMY_RENT_DATA.length} tenants
        </p>

        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-700">
          <AlertCircle className="h-3.5 w-3.5" />
          {filteredTenants.filter(
            (tenant) => tenant.status === 'OVERDUE'
          ).length} overdue
        </p>
      </div>
    </section>
  );
};

const StatusBadge = ({ status, getStatusStyle }) => (
  <span
    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold ${getStatusStyle(status)}`}
  >
    {status === 'OVERDUE' && (
      <AlertCircle className="h-3 w-3" />
    )}
    {status}
  </span>
);

const CallButton = ({ tenant, onCall }) => (
  <button
    type="button"
    onClick={() => onCall(tenant.phone)}
    className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
    aria-label={`Call ${tenant.name} at ${tenant.phone}`}
  >
    <Phone className="h-3.5 w-3.5" />
    Call
  </button>
);

export default OccupancyBar;