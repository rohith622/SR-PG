import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import {
  DoorClosed,
  BedDouble,
  UserCheck,
  CheckCircle,
  Users,
  IndianRupee,
} from 'lucide-react';

export const SummaryCards = ({ summary, onCardClick }) => {
  const cards = [
    {
      id: 'rooms',
      title: 'Total Rooms',
      value: summary?.totalRooms ?? 0,
      subtext: 'Configured rooms',
      icon: DoorClosed,
      color: 'blue',
      badge: null,
      clickable: true,
      targetTab: 'beds',
    },
    {
      id: 'beds',
      title: 'Total Beds',
      value: summary?.totalBeds ?? 0,
      subtext: 'Across all rooms',
      icon: BedDouble,
      color: 'indigo',
      badge: `${summary?.maintenanceBeds || 0} in maintenance`,
      clickable: true,
      targetTab: 'beds',
    },
    {
      id: 'occupied',
      title: 'Occupied Beds',
      value: summary?.occupiedBeds ?? 0,
      subtext: `${summary?.occupancyRate || 0}% total occupancy`,
      icon: UserCheck,
      color: 'blue',
      badge: 'Active Stays',
      clickable: true,
      targetTab: 'beds',
      filter: 'OCCUPIED',
    },
    {
      id: 'available',
      title: 'Available Beds',
      value: summary?.availableBeds ?? 0,
      subtext: 'Ready for allocation',
      icon: CheckCircle,
      color: 'emerald',
      badge: 'Vacant',
      clickable: true,
      targetTab: 'beds',
      filter: 'AVAILABLE',
    },
    {
      id: 'tenants',
      title: 'Active Tenants',
      value: summary?.activeTenants ?? 0,
      subtext: 'Currently residing',
      icon: Users,
      color: 'purple',
      badge: null,
      clickable: false,
    },
    {
      id: 'rent',
      title: 'Rent Pending',
      value: formatCurrency(summary?.rent?.pending ?? 0),
      subtext: summary?.rent?.overdueCount
        ? `${summary.rent.overdueCount} tenant(s) overdue`
        : 'All up to date',
      icon: IndianRupee,
      color: summary?.rent?.pending > 0 ? 'rose' : 'emerald',
      badge: summary?.rent?.pending > 0 ? 'Action Needed' : 'Settled',
      clickable: false,
    },
  ];

  const colorStyles = {
    blue: {
      bg: 'bg-blue-50 text-blue-700',
      border: 'hover:border-blue-300',
      badge: 'bg-blue-100 text-blue-800',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-700',
      border: 'hover:border-indigo-300',
      badge: 'bg-indigo-100 text-indigo-800',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700',
      border: 'hover:border-emerald-300',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-700',
      border: 'hover:border-purple-300',
      badge: 'bg-purple-100 text-purple-800',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-700',
      border: 'hover:border-rose-300',
      badge: 'bg-rose-100 text-rose-800',
    },
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const color = colorStyles[card.color] || colorStyles.blue;

        return (
          <div
            key={card.id}
            onClick={() => {
              if (card.clickable && onCardClick) {
                onCardClick(card);
              }
            }}
            className={`
              rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all duration-200 select-none flex flex-col justify-between
              ${card.clickable ? 'cursor-pointer hover:shadow-sm ' + color.border : ''}
            `}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg ${color.bg}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium truncate">
                {card.subtext}
              </span>
              {card.badge && (
                <span className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${color.badge}`}>
                  {card.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
