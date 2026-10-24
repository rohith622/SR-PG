
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
  'group inline-flex min-h-8 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold leading-tight transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#c6a96a] hover:bg-gradient-to-r hover:from-[#123d2d] hover:via-[#176044] hover:to-[#246b4c] hover:text-white hover:shadow-[0_8px_22px_-8px_rgba(198,169,106,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6a96a] active:translate-y-0 active:scale-[0.98] sm:min-h-10 sm:gap-2 sm:px-3.5 sm:py-2.5 sm:text-sm sm:leading-normal';

export const QuickActions = ({
  onAddRoom,
  onAddBed,
  onAddTenant,
  onViewBedManagement,
}) => {
  return (
    <section className="relative mb-5 overflow-hidden rounded-xl border border-emerald-700/70 bg-gradient-to-br from-[#0b2c20] via-[#123d2d] to-[#08271d] p-3.5 text-white shadow-[0_12px_30px_-16px_rgba(11,44,32,0.65)] sm:mb-6 sm:rounded-2xl sm:p-6">
      {/* Decorative gradient glow */}
      <div className="pointer-events-none absolute -right-12 -top-20 h-40 w-40 rounded-full bg-[#c6a96a]/10 blur-3xl sm:h-52 sm:w-52" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl sm:h-48 sm:w-48" />

      <div className="relative flex flex-col gap-3 sm:gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* Compact heading */}
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 sm:gap-2">
            <Zap size={13} className="shrink-0 text-[#e4c77e] sm:h-4 sm:w-4" />
            <span className="text-[9px] font-bold uppercase tracking-[0.17em] text-emerald-300 sm:text-[11px] sm:tracking-[0.2em]">
              Quick Access
            </span>
          </div>

          <h3 className="text-base font-bold leading-snug tracking-tight sm:text-2xl sm:font-extrabold">
            Quick Property Actions
          </h3>

          <p className="mt-1 max-w-md text-[11px] leading-relaxed text-emerald-100/75 sm:mt-2 sm:text-sm">
            Manage rooms, beds, and tenant allocations from one place.
          </p>
        </div>

        {/* Responsive action buttons */}
        <div className="grid grid-cols-2 gap-1.5 min-[380px]:gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5 xl:shrink-0">
          <button
            type="button"
            onClick={onAddRoom}
            className={`${buttonBase} border-emerald-500/70 bg-white/[0.04] text-white`}
          >
            <DoorClosed size={14} className="shrink-0 text-[#e4c77e] transition-colors group-hover:text-white sm:h-[19px] sm:w-[19px]" />
            <span>Add Room</span>
          </button>

          <button
            type="button"
            onClick={onAddBed}
            className={`${buttonBase} border-white/30 bg-white/[0.04] text-white`}
          >
            <BedDouble size={14} className="shrink-0 text-emerald-200 transition-colors group-hover:text-white sm:h-[19px] sm:w-[19px]" />
            <span>Add Bed</span>
          </button>

          <button
            type="button"
            onClick={onAddTenant}
            className={`${buttonBase} border-[#e2c47d] bg-gradient-to-r from-[#f7e8bd] to-[#dfc071] text-[#173d2d] shadow-sm shadow-black/10 hover:from-[#123d2d] hover:via-[#176044] hover:to-[#246b4c] hover:text-white`}
          >
            <UserPlus size={14} className="shrink-0 sm:h-[19px] sm:w-[19px]" />
            <span>Add Tenant</span>
          </button>

          <button
            type="button"
            onClick={onViewBedManagement}
            className={`${buttonBase} border-emerald-500/60 bg-white/[0.03] text-white`}
          >
            <LayoutGrid size={14} className="shrink-0 text-emerald-200 transition-colors group-hover:text-white sm:h-[19px] sm:w-[19px]" />
            <span>Bed Management</span>
            <ArrowRight size={12} className="shrink-0 text-[#e4c77e] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white sm:h-[17px] sm:w-[17px]" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default QuickActions;
