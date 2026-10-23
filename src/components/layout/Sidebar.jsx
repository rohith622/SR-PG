import React from 'react';
import {
  LayoutDashboard,
  BedDouble,
  History,
  Building2,
  LogOut,
  IndianRupee
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'beds', label: 'Bed Management', icon: BedDouble },
  { id: 'history', label: 'Tenant History', icon: History },
    { id: 'rent', label: 'Rent Payment', icon: IndianRupee },

];

export const Sidebar = ({
  currentTab,
  onSelectTab,
  onSignOut,
  propertyInfo,
}) => {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen sticky top-0 bg-[#0B1713] border-r border-emerald-900/50 z-30">

      {/* Logo */}
      <div className="p-5 border-b border-emerald-900/50">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 w-full text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-900 border border-emerald-700/50 flex items-center justify-center text-emerald-100 shadow-lg shadow-emerald-950/40">
            <Building2 className="w-5 h-5" />
          </div>

          <h1 className="text-sm font-bold text-white truncate">
            {propertyInfo?.name || 'SR PG Living'}
          </h1>
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-900 text-emerald-50 shadow-md shadow-black/20 ring-1 ring-emerald-700/50'
                  : 'text-slate-400 hover:bg-emerald-950/70 hover:text-emerald-300'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-emerald-400" />
              )}

              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-emerald-300' : ''
                }`}
              />

              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-emerald-900/50">
        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;