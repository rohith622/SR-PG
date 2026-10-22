import React from 'react';
import { formatDateTime } from '../../utils/formatters';
import {
  UserPlus,
  LogOut,
  IndianRupee,
  DoorClosed,
  BedDouble,
  Activity,
} from 'lucide-react';

export const RecentActivityList = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs text-center text-xs text-slate-400">
        No recent activities recorded yet.
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'checkin':
        return { icon: UserPlus, color: 'bg-blue-100 text-blue-600' };
      case 'checkout':
        return { icon: LogOut, color: 'bg-rose-100 text-rose-600' };
      case 'payment':
        return { icon: IndianRupee, color: 'bg-emerald-100 text-emerald-600' };
      case 'room_added':
        return { icon: DoorClosed, color: 'bg-indigo-100 text-indigo-600' };
      case 'bed_added':
        return { icon: BedDouble, color: 'bg-purple-100 text-purple-600' };
      default:
        return { icon: Activity, color: 'bg-slate-100 text-slate-600' };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-slate-900 text-base">
          Recent Property Activity
        </h3>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Audit Trail
        </span>
      </div>

      <div className="space-y-3.5">
        {activities.map((item) => {
          const { icon: Icon, color } = getIcon(item.type);

          return (
            <div key={item.id} className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                  {item.description}
                </p>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  {formatDateTime(item.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivityList;
