
import React, { useMemo, useState } from 'react';
import {
  Phone,
  IndianRupee,
  AlertCircle,
  ChevronDown,
  Filter,
  MessageCircle,
  MoreVertical,
  FileText,
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
        return 'bg-rose-100 text-rose-700';

      case 'DUE TODAY':
        return 'bg-amber-100 text-amber-800';

      default:
        return 'bg-sky-100 text-sky-800';
    }
  };

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-[#eae4d8] bg-gradient-to-br from-white via-white to-[#fdfbf6] shadow-sm shadow-[#6d5730]/[0.05]">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#eee9df] p-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <FileText className="h-5 w-5" strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
              Rent Due Management
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
              Track pending payments and contact tenants.
            </p>
          </div>
        </div>

        {/* Filter and pending total */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(145px,1fr)_auto] sm:items-center sm:gap-3">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-800" />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter tenants by rent status"
              className="h-11 w-full appearance-none rounded-xl border border-[#e5e1d7] bg-white py-2 pl-9 pr-9 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="ALL">All Status</option>
              <option value="OVERDUE">Overdue</option>
              <option value="DUE TODAY">Due Today</option>
              <option value="UPCOMING">Upcoming</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex min-w-0 items-center gap-3 rounded-xl bg-gradient-to-r from-[#064631] to-[#0c3829] px-4 py-2.5 text-white shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <IndianRupee className="h-5 w-5 text-emerald-300" />
            </div>

            <div className="min-w-0">
              <p className="whitespace-nowrap text-[10px] font-medium text-emerald-100/80">
                Total Pending
              </p>
              <p className="whitespace-nowrap text-sm font-extrabold tabular-nums sm:text-base">
                {formatCurrency(totalPending)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#eee9df] bg-[#f8f6f0] text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">Tenant</th>
              <th className="px-4 py-3.5">Room</th>
              <th className="px-4 py-3.5">Due Date</th>
              <th className="px-4 py-3.5">Amount Due</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#f0ece4]">
            {filteredTenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="transition-colors hover:bg-[#f8f6f0]/80"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={tenant.name} />

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900">
                        {tenant.name}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Room {tenant.roomNumber}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5 text-xs font-medium text-slate-700">
                  {tenant.roomNumber}
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                  <p>{tenant.dueDate}</p>
                  {tenant.status === 'OVERDUE' && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600">
                      Payment overdue
                    </p>
                  )}
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-xs font-extrabold text-slate-900">
                  {formatCurrency(tenant.amountDue)}
                </td>

                <td className="px-4 py-3.5">
                  <StatusBadge
                    status={tenant.status}
                    getStatusStyle={getStatusStyle}
                  />
                </td>

                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <IconAction
                      label={`Call ${tenant.name}`}
                      onClick={() => handleCall(tenant.phone)}
                    >
                      <Phone className="h-4 w-4" />
                    </IconAction>

                    <IconAction
                      label={`WhatsApp ${tenant.name}`}
                      onClick={() =>
                        window.open(
                          `https://wa.me/91${tenant.phone}`,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                    >
                      <MessageCircle className="h-4 w-4" />
                    </IconAction>

                    <IconAction
                      label={`More actions for ${tenant.name}`}
                      onClick={() => handleCall(tenant.phone)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </IconAction>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile tenant list */}
      <div className="divide-y divide-[#eee9df] md:hidden">
        {filteredTenants.map((tenant) => (
          <article key={tenant.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={tenant.name} />

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {tenant.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Room {tenant.roomNumber}
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

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#f0ece4] pt-3">
              <p className="text-[11px] text-slate-500">
                Due: {tenant.dueDate}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCall(tenant.phone)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-emerald-900 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call
                </button>

                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `https://wa.me/91${tenant.phone}`,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                  aria-label={`WhatsApp ${tenant.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty state */}
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
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eee9df] bg-[#faf8f3] px-4 py-3 sm:px-5">
        <p className="text-[11px] text-slate-500">
          Showing {filteredTenants.length} of {DUMMY_RENT_DATA.length} tenants
        </p>

        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-700">
          <AlertCircle className="h-3.5 w-3.5" />
          {
            filteredTenants.filter(
              (tenant) => tenant.status === 'OVERDUE'
            ).length
          } overdue
        </p>
      </div>
    </section>
  );
};

const Avatar = ({ name }) => (
  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e9dfc8] bg-gradient-to-br from-[#fbf0d9] to-[#e9d6ae] text-xs font-bold text-[#76501d]">
    {name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)}
  </div>
);

const StatusBadge = ({ status, getStatusStyle }) => (
  <span
    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] font-bold ${getStatusStyle(status)}`}
  >
    {status === 'OVERDUE' && <AlertCircle className="h-3 w-3" />}
    {status}
  </span>
);

const IconAction = ({ label, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-800 transition-colors hover:bg-emerald-50 hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
  >
    {children}
  </button>
);

export default OccupancyBar;
