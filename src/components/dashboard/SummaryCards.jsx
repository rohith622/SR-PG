import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import {
  DoorClosed,
  BedDouble,
  UserCheck,
  CheckCircle,
  Users,
  IndianRupee,
  ArrowUpRight,
} from 'lucide-react';

// Only the status dot carries color. Everything else stays neutral.
const DOT = {
  neutral: 'bg-stone-300',
  good: 'bg-emerald-500',
  warn: 'bg-rose-500',
};

export const SummaryCards = ({ summary, onCardClick }) => {
  const rentPending = summary?.rent?.pending ?? 0;
  const occupancyRate = Number(summary?.occupancyRate || 0);

  const cards = [
    {
      id: 'rooms',
      title: 'Rooms',
      value: summary?.totalRooms ?? 0,
      subtext: 'Configured rooms',
      icon: DoorClosed,
      clickable: true,
      targetTab: 'beds',
    },
    {
      id: 'beds',
      title: 'Beds',
      value: summary?.totalBeds ?? 0,
      subtext: 'Across all rooms',
      status: summary?.maintenanceBeds
        ? { label: `${summary.maintenanceBeds} in maintenance`, tone: 'warn' }
        : null,
      icon: BedDouble,
      clickable: true,
      targetTab: 'beds',
    },
    {
      id: 'occupied',
      title: 'Occupied',
      value: summary?.occupiedBeds ?? 0,
      subtext: `${occupancyRate}% occupancy`,
      progress: occupancyRate,
      icon: UserCheck,
      clickable: true,
      targetTab: 'beds',
      filter: 'OCCUPIED',
    },
    {
      id: 'available',
      title: 'Available',
      value: summary?.availableBeds ?? 0,
      subtext: 'Ready for allocation',
      status: { label: 'Vacant', tone: 'good' },
      icon: CheckCircle,
      clickable: true,
      targetTab: 'beds',
      filter: 'AVAILABLE',
    },
    {
      id: 'tenants',
      title: 'Tenants',
      value: summary?.activeTenants ?? 0,
      subtext: 'Currently residing',
      icon: Users,
      clickable: false,
    },
    {
      id: 'rent',
      title: 'Rent pending',
      value: formatCurrency(rentPending),
      subtext: summary?.rent?.overdueCount
        ? `${summary.rent.overdueCount} tenant(s) overdue`
        : 'All up to date',
      status:
        rentPending > 0
          ? { label: 'Action needed', tone: 'warn' }
          : { label: 'Settled', tone: 'good' },
      icon: IndianRupee,
      clickable: false,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;

        const content = (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-500">
                {card.title}
              </p>
              <Icon
                className="h-4 w-4 text-stone-400 transition-colors group-hover:text-emerald-700"
                strokeWidth={1.6}
              />
            </div>

            {/* Value */}
            <p className="mt-6 break-words text-[30px] font-semibold leading-none tracking-tight text-stone-900 tabular-nums">
              {card.value}
            </p>

            {/* Optional occupancy bar */}
            {typeof card.progress === 'number' && (
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-emerald-700 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, card.progress))}%` }}
                />
              </div>
            )}

            {/* Footer */}
            <div className={`flex flex-col gap-1.5 ${typeof card.progress === 'number' ? 'mt-3' : 'mt-5'}`}>
              <p className="pr-5 text-xs leading-snug text-stone-500">{card.subtext}</p>

              {card.status && (
                <span className="flex items-center gap-1.5 text-[11px] font-medium leading-snug text-stone-600">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[card.status.tone] || DOT.neutral}`} />
                  {card.status.label}
                </span>
              )}
            </div>

            {card.clickable && (
              <ArrowUpRight className="absolute bottom-5 right-5 h-3.5 w-3.5 text-stone-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            )}
          </>
        );

        const base =
          'group relative flex min-h-[150px] flex-col rounded-lg border border-stone-200/80 bg-white p-5 transition-all duration-200';

        const interactive =
          'cursor-pointer hover:border-stone-300 hover:shadow-[0_10px_30px_-14px_rgba(28,25,23,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2';

        return card.clickable ? (
          <button
            key={card.id}
            type="button"
            onClick={() => onCardClick?.(card)}
            className={`${base} ${interactive} w-full text-left`}
            aria-label={`${card.title}: ${card.value}. View ${card.title.toLowerCase()}`}
          >
            {content}
          </button>
        ) : (
          <div key={card.id} className={base}>
            {content}
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;