
import React from 'react';
import {
  DoorClosed,
  BedDouble,
  UserPlus,
  ArrowRight,
  LayoutGrid,
  Zap,
} from 'lucide-react';

const buttonBase =
  'group inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#c6a96a] hover:bg-gradient-to-r hover:from-[#123d2d] hover:via-[#176044] hover:to-[#246b4c] hover:text-white hover:shadow-[0_8px_22px_-8px_rgba(198,169,106,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6a96a] active:translate-y-0 active:scale-[0.98]';

export const QuickActions = ({
  onAddRoom,
  onAddBed,
  onAddTenant,
  onViewBedManagement,
}) => {
  return (
    <section className="relative mb-6 overflow-hidden rounded-2xl border border-emerald-700/70 bg-gradient-to-br from-[#0b2c20] via-[#123d2d] to-[#08271d] p-5 text-white shadow-[0_12px_30px_-16px_rgba(11,44,32,0.65)] sm:p-6">
      {/* Decorative gradient glow */}
      <div className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full bg-[#c6a96a]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* Heading */}
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Zap size={16} className="text-[#e4c77e]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              Quick Access
            </span>
          </div>

          <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Quick Property Actions
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-emerald-100/75">
            Manage rooms, beds, and tenant allocations from one place.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onAddRoom}
            className={`${buttonBase} border-emerald-500/70 bg-white/[0.04] text-white`}
          >
            <DoorClosed size={19} className="text-[#e4c77e] transition-colors group-hover:text-white" />
            <span>Add Room</span>
          </button>

          <button
            type="button"
            onClick={onAddBed}
            className={`${buttonBase} border-white/30 bg-white/[0.04] text-white`}
          >
            <BedDouble size={19} className="text-emerald-200 transition-colors group-hover:text-white" />
            <span>Add Bed</span>
          </button>

          <button
            type="button"
            onClick={onAddTenant}
            className={`${buttonBase} border-[#e2c47d] bg-gradient-to-r from-[#f7e8bd] to-[#dfc071] text-[#173d2d] shadow-md shadow-black/10 hover:from-[#123d2d] hover:via-[#176044] hover:to-[#246b4c] hover:text-white`}
          >
            <UserPlus size={19} />
            <span>Add Tenant</span>
          </button>

          <button
            type="button"
            onClick={onViewBedManagement}
            className={`${buttonBase} border-emerald-500/60 bg-white/[0.03] text-white`}
          >
            <LayoutGrid size={19} className="text-emerald-200 transition-colors group-hover:text-white" />
            <span>Bed Management</span>
            <ArrowRight size={17} className="text-[#e4c77e] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default QuickActions;
