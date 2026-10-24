
import React from 'react';
import { Menu, Building2, Sparkles } from 'lucide-react';

export const MobileHeader = ({ onOpenDrawer, propertyInfo }) => {
  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-between gap-3 border-b border-[#d7b76c]/20 bg-[#103b2c]/[0.98] px-3 py-3 shadow-sm shadow-black/10 backdrop-blur-md sm:px-5 lg:hidden">
      {/* Brand */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d7b76c]/40 bg-[#d7b76c]/10 shadow-inner sm:h-11 sm:w-11">
          <Building2
            className="h-5 w-5 text-[#e8cd8b] sm:h-6 sm:w-6"
            strokeWidth={1.8}
          />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-extrabold tracking-tight text-white sm:text-base">
            {propertyInfo?.name || 'SR PG Living'}
          </h1>

          <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-[#e8cd8b]/90 sm:text-[11px]">
            <Sparkles className="h-3 w-3 shrink-0" />
            <span className="truncate">Property Management</span>
          </p>
        </div>
      </div>

      {/* Menu button */}
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Open navigation menu"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#e8cd8b] transition-colors hover:border-[#d7b76c]/40 hover:bg-white/10 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b76c]"
      >
        <Menu className="h-6 w-6" strokeWidth={1.8} />
      </button>
    </header>
  );
};

export default MobileHeader;
