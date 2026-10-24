
import React from 'react';
import {
  LayoutDashboard,
  BedDouble,
  History,
  Building2,
  LogOut,
  IndianRupee,
  ChevronRight,
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
    <aside className="sticky top-0 z-30 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-[#103b2c] via-[#0c3225] to-[#08271d] text-white lg:flex">
      {/* Brand */}
      <div className="border-b border-white/10 px-5 py-6">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className="group flex w-full items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b76c]"
          aria-label="Go to dashboard"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d7b76c]/50 bg-[#d7b76c]/10 shadow-inner">
            <Building2
              className="h-6 w-6 text-[#e8cd8b]"
              strokeWidth={1.7}
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold tracking-tight text-white">
              {propertyInfo?.name || 'SR PG Living'}
            </h1>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#d7b76c]">
              Property Management
            </p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 space-y-2 overflow-y-auto px-3 py-6"
        aria-label="Main navigation"
      >
        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/55">
          Workspace
        </p>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b76c] ${
                isActive
                  ? 'border border-[#d7b76c]/25 bg-gradient-to-r from-[#d7b76c]/20 to-[#d7b76c]/5 text-[#f4dfa7] shadow-sm shadow-black/10'
                  : 'border border-transparent text-emerald-100/70 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-[#e3c477]" />
              )}

              <Icon
                className={`h-[19px] w-[19px] shrink-0 transition-colors ${
                  isActive
                    ? 'text-[#e8cd8b]'
                    : 'text-emerald-200/65 group-hover:text-[#e8cd8b]'
                }`}
                strokeWidth={1.8}
              />

              <span className="min-w-0 flex-1">{item.label}</span>

              {isActive && (
                <ChevronRight className="h-4 w-4 shrink-0 text-[#e8cd8b]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Property information */}
      <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-black/10 p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100/10">
            <Building2 className="h-4 w-4 text-[#e8cd8b]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {propertyInfo?.name || 'SR PG Living'}
            </p>
            <p className="mt-1 text-[10px] text-emerald-100/60">
              Property workspace
            </p>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={onSignOut}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-emerald-100/70 transition-colors hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Sign Out</span>
        </button>
        <p className="mt-3 text-center text-[10px] tracking-wide text-emerald-100/35">
          SR PG Living · Property Suite
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
