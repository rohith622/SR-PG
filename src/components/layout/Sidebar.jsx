import React from 'react';
import {
  LayoutDashboard,
  BedDouble,
  History,
  Building2,
  LogOut,
  RotateCcw,
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Quick overview and actions',
  },
  {
    id: 'beds',
    label: 'Bed Management',
    icon: BedDouble,
    description: 'Rooms, beds & occupancy',
  },
  {
    id: 'history',
    label: 'Tenant History',
    icon: History,
    description: 'Checked-out records & audit',
  },
];

export const Sidebar = ({
  currentTab,
  onSelectTab,
  onResetData,
  onSignOut,
  propertyInfo,
}) => {
  return (
    <aside
      aria-label="Desktop Sidebar Navigation"
      className="hidden lg:flex w-[256px] shrink-0 flex-col justify-between border-r border-slate-200/80 bg-white h-screen sticky top-0 select-none z-30"
    >
      {/* Top Brand / Logo */}
      <div className="p-5 border-b border-slate-100">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 text-left w-full group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                {propertyInfo?.name || 'SR PG Living'}
              </h1>
            </div>
            <p className="text-[11px] font-medium text-slate-400 truncate">
              Property Management
            </p>
          </div>
        </button>
      </div>

      {/* Main 3-Tab Navigation (Page 1 & 2) */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`
                w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left group
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 group-hover:text-slate-600 bg-slate-100/70'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
              </div>
              <div className="flex-1 truncate">
                <span>{item.label}</span>
              </div>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Utility Area */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col gap-3">
        {/* Active Property Card */}
        <div className="rounded-xl border border-slate-200/70 bg-white p-3 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Property
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              Live
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-800 truncate">
            {propertyInfo?.name || 'SR PG Living'}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            HSR Layout, Sector 4
          </p>
        </div>

        {/* Demo Helper: Reset Data */}
        <button
          type="button"
          onClick={onResetData}
          className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-slate-100/80 transition-colors w-full text-left"
          title="Reset to initial sample demo data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Demo Data</span>
        </button>

        {/* Sign Out */}
        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors w-full text-left"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
