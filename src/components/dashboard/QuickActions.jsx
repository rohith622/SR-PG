import React from 'react';
import { DoorClosed, BedDouble, UserPlus, ArrowRight } from 'lucide-react';

export const QuickActions = ({
  onAddRoom,
  onAddBed,
  onAddTenant,
  onViewBedManagement,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-5 text-white shadow-md mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-extrabold tracking-tight">
          Quick Property Actions
        </h3>
        <p className="text-xs text-blue-100/90 mt-0.5 max-w-md leading-relaxed">
          One-click shortcuts to expand room capacity, add beds, and allocate tenants with auto-validation.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onAddRoom}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-xs transition-colors border border-white/15"
        >
          <DoorClosed className="w-4 h-4" />
          <span>Add Room</span>
        </button>

        <button
          type="button"
          onClick={onAddBed}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-xs transition-colors border border-white/15"
        >
          <BedDouble className="w-4 h-4" />
          <span>Add Bed</span>
        </button>

        <button
          type="button"
          onClick={onAddTenant}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-blue-900 text-xs font-extrabold shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4 text-blue-600" />
          <span>Add Tenant</span>
        </button>

        <button
          type="button"
          onClick={onViewBedManagement}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900/60 hover:bg-blue-900 text-blue-100 text-xs font-semibold transition-colors"
        >
          <span>Bed Management</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
