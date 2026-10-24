
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
  Building2,
  Bed,
  UserRound,
  KeyRound,
  FileText,
} from 'lucide-react';

const TONES = {
  green: {
    tile: 'bg-emerald-100/80',
    icon: 'text-emerald-800',
    decoration: 'text-emerald-900/[0.055]',
  },
  gold: {
    tile: 'bg-[#f7efd9]',
    icon: 'text-[#a97920]',
    decoration: 'text-[#a97920]/[0.07]',
  },
  red: {
    tile: 'bg-rose-100',
    icon: 'text-rose-600',
    decoration: 'text-rose-900/[0.055]',
  },
};

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
      decoration: Building2,
      tone: 'green',
      clickable: true,
      targetTab: 'beds',
    },
    {
      id: 'beds',
      title: 'Beds',
      value: summary?.totalBeds ?? 0,
      subtext: 'Across all rooms',
      status: summary?.maintenanceBeds
        ? {
            label: `${summary.maintenanceBeds} in maintenance`,
            tone: 'warn',
          }
        : null,
      icon: BedDouble,
      decoration: Bed,
      tone: 'gold',
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
      decoration: Users,
      tone: 'green',
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
      icon: KeyRound,
      decoration: DoorClosed,
      tone: 'green',
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
      decoration: Users,
      tone: 'gold',
      clickable: false,
    },
    {
      id: 'rent',
      title: 'Rent Pending',
      value: formatCurrency(rentPending),
      subtext: summary?.rent?.overdueCount
        ? `${summary.rent.overdueCount} tenant(s) overdue`
        : 'All up to date',
      status:
        rentPending > 0
          ? { label: 'Action needed', tone: 'warn' }
          : { label: 'Settled', tone: 'good' },
      icon: IndianRupee,
      decoration: FileText,
      tone: 'red',
      clickable: false,
    },
  ];

  return (
    <section
      aria-label="Property summary"
      className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const Decoration = card.decoration;
        const tone = TONES[card.tone] || TONES.green;

        const content = (
          <>
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone.tile} sm:h-[54px] sm:w-[54px]`}
              >
                <Icon
                  aria-hidden="true"
                  className={`h-6 w-6 ${tone.icon}`}
                  strokeWidth={2.2}
                />
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-slate-500 sm:text-xs">
                  {card.title}
                </p>

                <p className="mt-2 break-words text-[28px] font-extrabold leading-none tracking-tight text-slate-950 tabular-nums sm:text-[32px]">
                  {card.value}
                </p>
              </div>
            </div>

            {typeof card.progress === 'number' && (
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
                    role="progressbar"
                    aria-label="Bed occupancy"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.min(
                      100,
                      Math.max(0, card.progress)
                    )}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-800 to-emerald-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, card.progress)
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {card.progress}%
                  </span>
                </div>
              </div>
            )}

            <div
              className={`relative z-10 mt-3 flex flex-col gap-2 ${
                typeof card.progress === 'number' ? '' : 'sm:mt-4'
              }`}
            >
              <p className="text-xs leading-relaxed text-slate-500 sm:text-[13px]">
                {card.subtext}
              </p>

              {card.status && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      DOT[card.status.tone] || DOT.neutral
                    }`}
                  />
                  {card.status.label}
                </span>
              )}
            </div>

            <Decoration
              aria-hidden="true"
              className={`pointer-events-none absolute bottom-3 right-3 h-14 w-14 ${tone.decoration} sm:bottom-4 sm:right-4 sm:h-[72px] sm:w-[72px]`}
              strokeWidth={2.5}
            />

            {card.clickable && (
              <ArrowUpRight
                aria-hidden="true"
                className="absolute right-4 top-4 h-4 w-4 text-emerald-800 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
              />
            )}
          </>
        );

        const base =
          'group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#eae5d9] bg-gradient-to-br from-white via-white to-[#fdfbf6] p-4 text-left shadow-sm shadow-[#6d5730]/[0.04] transition-all duration-200 sm:min-h-[176px] sm:p-5';

        const interactive =
          'cursor-pointer hover:-translate-y-0.5 hover:border-emerald-800/30 hover:shadow-lg hover:shadow-emerald-950/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2';

        return card.clickable ? (
          <button
            key={card.id}
            type="button"
            onClick={() => onCardClick?.(card)}
            className={`${base} ${interactive} w-full`}
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
    </section>
  );
};

export default SummaryCards;
