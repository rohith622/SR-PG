import React, { useMemo, useState } from 'react';
import {
  CalendarClock,
  Phone,
  DoorClosed,
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ChevronDown,
  ArrowRight,
  IndianRupee,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const VacateReminders = ({
  reminders = [],
  onNavigateToBeds,
}) => {
  const [filter, setFilter] = useState('ALL');

  const filteredReminders = useMemo(() => {
    if (!reminders || !reminders.length) return [];
    if (filter === 'ALL') return reminders;
    return reminders.filter((r) => r.status === filter);
  }, [reminders, filter]);

  const counts = useMemo(() => {
    const total = reminders.length;
    const today = reminders.filter((r) => r.status === 'TODAY').length;
    const tomorrow = reminders.filter((r) => r.status === 'TOMORROW').length;
    const overdue = reminders.filter((r) => r.status === 'OVERDUE').length;
    return { total, today, tomorrow, overdue };
  }, [reminders]);

  const handleCall = (phone) => {
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  const getUrgencyBadge = (item) => {
    switch (item.status) {
      case 'OVERDUE':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: AlertTriangle,
          label: `Vacate Overdue (${Math.abs(item.daysLeft)} days ago)`,
        };
      case 'TODAY':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300 font-bold animate-pulse',
          icon: Clock,
          label: 'Vacating Today!',
        };
      case 'TOMORROW':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Clock,
          label: 'Vacating Tomorrow (1 day left)',
        };
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: Calendar,
          label: `${item.daysLeft != null ? `${item.daysLeft} days left` : 'Upcoming'} (${item.formattedDate})`,
        };
    }
  };

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-[#eae4d8] bg-gradient-to-br from-white via-white to-[#fffcf7] shadow-sm shadow-[#6d5730]/[0.05]">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#eee9df] p-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
            <CalendarClock className="h-5 w-5" strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                Vacate & Daily Stay Reminders
              </h2>
              {counts.today > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                  <Clock size={12} />
                  {counts.today} Today
                </span>
              )}
              {counts.overdue > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                  <AlertTriangle size={12} />
                  {counts.overdue} Overdue
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
              Track short-term guests (3 - 10 days) and tenants scheduled to checkout.
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[140px]">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter vacate reminders"
              className="h-10 w-full appearance-none rounded-xl border border-[#e5e1d7] bg-white py-1.5 pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
            >
              <option value="ALL">All Reminders ({counts.total})</option>
              <option value="TODAY">Vacating Today ({counts.today})</option>
              <option value="TOMORROW">Tomorrow ({counts.tomorrow})</option>
              <option value="OVERDUE">Overdue ({counts.overdue})</option>
              <option value="UPCOMING">Upcoming</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {onNavigateToBeds && (
            <button
              type="button"
              onClick={onNavigateToBeds}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-emerald-800/20 bg-emerald-50 px-3 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100"
            >
              <span>Manage Beds</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-800">
            No pending vacate reminders
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            {filter === 'ALL'
              ? 'No tenants or daily stayers are currently scheduled to vacate.'
              : `No vacate reminders found for the "${filter.toLowerCase()}" filter.`}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredReminders.map((item) => {
            const urgency = getUrgencyBadge(item);
            const UrgencyIcon = urgency.icon;

            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 p-4 transition hover:bg-[#fbf9f4] sm:px-6 sm:py-4 md:flex-row md:items-center md:justify-between"
              >
                {/* Left details */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <DoorClosed className="h-5 w-5 text-emerald-800" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {item.name}
                      </h4>

                      <span className="inline-flex items-center rounded-md bg-[#f6edd9] px-2 py-0.5 text-[11px] font-bold text-[#8d6215]">
                        {item.stayType === 'Daily'
                          ? `Daily Stay • ${item.stayDurationDays || 0} Days`
                          : 'Monthly Stay'}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${urgency.bg}`}
                      >
                        <UrgencyIcon size={12} />
                        {urgency.label}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>
                        Room <strong className="text-slate-800">{item.roomNumber}</strong> · Bed{' '}
                        <strong className="text-slate-800">{item.bedNumber}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Check-in: <span className="font-medium text-slate-700">{item.joiningDate}</span>
                      </span>
                      <span>•</span>
                      <span>
                        Vacate Date:{' '}
                        <span className="font-semibold text-slate-900">
                          {item.formattedDate || item.expectedCheckoutDate || '—'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right pricing & action */}
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="text-right sm:pr-2">
                    {item.stayType === 'Daily' && item.dailyRate > 0 && (
                      <p className="text-[11px] text-slate-500">
                        ₹{item.dailyRate}/day
                      </p>
                    )}
                    <p className="text-sm font-extrabold text-slate-900">
                      {formatCurrency(item.monthlyRent || 0)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.phone && (
                      <button
                        type="button"
                        onClick={() => handleCall(item.phone)}
                        title={`Call ${item.name} (${item.phone})`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-emerald-800 shadow-sm transition"
                      >
                        <Phone size={15} />
                      </button>
                    )}

                    {onNavigateToBeds && (
                      <button
                        type="button"
                        onClick={onNavigateToBeds}
                        className="rounded-xl bg-gradient-to-r from-[#123d2d] to-[#1c5d43] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:from-[#174b36] hover:to-[#247451]"
                      >
                        Check Out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default VacateReminders;

