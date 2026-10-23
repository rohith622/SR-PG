import React from 'react';
import {
  DoorClosed,
  BedDouble,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

export const QuickActions = ({
  onAddRoom,
  onAddBed,
  onAddTenant,
  onViewBedManagement,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-5 rounded-lg border border-emerald-800/50 bg-gradient-to-br from-[#0B1713] via-emerald-950 to-[#10271D] p-5 text-white shadow-lg shadow-emerald-950/10 md:flex-row md:items-center md:justify-between md:p-6">

      {/* Heading */}
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
            Quick Access
          </span>
        </div>

        <h3 className="text-lg font-extrabold tracking-tight sm:text-xl">
          Quick Property Actions
        </h3>

        <p className="mt-1 max-w-md text-xs leading-relaxed text-emerald-100/70">
          Manage rooms, beds, and tenant allocations from one place.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onAddRoom}
          className="flex items-center gap-2 rounded-xl border border-emerald-700/60 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-emerald-50 transition-colors hover:border-emerald-500 hover:bg-emerald-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <DoorClosed className="h-4 w-4 text-emerald-300" />
          <span>Add Room</span>
        </button>

        <button
          type="button"
          onClick={onAddBed}
          className="flex items-center gap-2 rounded-xl border border-emerald-700/60 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-emerald-50 transition-colors hover:border-emerald-500 hover:bg-emerald-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <BedDouble className="h-4 w-4 text-emerald-300" />
          <span>Add Bed</span>
        </button>

        <button
          type="button"
          onClick={onAddTenant}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-emerald-950 shadow-sm shadow-black/10 transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Tenant</span>
        </button>

        <button
          type="button"
          onClick={onViewBedManagement}
          className="flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <span>Bed Management</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default QuickActions;