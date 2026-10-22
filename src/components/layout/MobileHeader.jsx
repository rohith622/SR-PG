import React from 'react';
import { Menu, Building2 } from 'lucide-react';

export const MobileHeader = ({ onOpenDrawer, propertyInfo }) => {
  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3">
      {/* Brand logo & name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-900 truncate">
            {propertyInfo?.name || 'SR PG Living'}
          </h1>
          <p className="text-[10px] text-slate-500 font-medium truncate">
            Property Portal
          </p>
        </div>
      </div>

      {/* Hamburger menu button with 44px min touch target */}
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Open navigation menu"
        className="flex items-center justify-center w-11 h-11 -mr-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Menu className="w-6 h-6" />
      </button>
    </header>
  );
};

export default MobileHeader;
