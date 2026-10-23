import React from 'react';
import { Menu, Building2 } from 'lucide-react';

export const MobileHeader = ({ onOpenDrawer, propertyInfo }) => {
  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-emerald-800/50 bg-[#0B1713]/95 backdrop-blur-md px-4 py-3">

      {/* Brand Logo & Name */}
      <button
        type="button"
        onClick={() => {}}
        className="flex items-center gap-2.5 min-w-0 text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-900 border border-emerald-700/50 flex items-center justify-center text-emerald-300 shadow-lg shadow-black/20 shrink-0">
          <Building2 className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <h1 className="text-sm font-bold text-white truncate">
            {propertyInfo?.name || 'SR PG Living'}
          </h1>

          <p className="text-[10px] text-emerald-300/80 font-medium truncate">
            Property Management
          </p>
        </div>
      </button>

      {/* Hamburger Menu */}
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Open navigation menu"
        className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl text-emerald-300 hover:bg-emerald-900/60 hover:text-white active:bg-emerald-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <Menu className="w-6 h-6" />
      </button>
    </header>
  );
};

export default MobileHeader;