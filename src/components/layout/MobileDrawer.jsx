import React, { useEffect, useRef } from 'react';
import { X, Building2, LogOut } from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';

export const MobileDrawer = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onSignOut,
  propertyInfo,
}) => {
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    const focusTimer = setTimeout(() => {
      drawerRef.current?.querySelector('button')?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation drawer"
      className="fixed inset-0 z-50 flex lg:hidden"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="relative z-10 flex h-full w-[280px] max-w-[85vw] flex-col
        bg-[#0B1713] shadow-2xl animate-slideInLeft"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b
          border-emerald-900/60 bg-emerald-950/50 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center
              justify-center rounded-xl border border-emerald-700/50
              bg-emerald-900 text-emerald-300">
              <Building2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {propertyInfo?.name || 'SR PG Living'}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-emerald-300/70">
                Property Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="ml-2 flex h-10 w-10 shrink-0 items-center
              justify-center rounded-xl text-slate-400 transition-colors
              hover:bg-emerald-900 hover:text-white
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-emerald-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6"
          aria-label="Mobile navigation">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase
            tracking-[0.18em] text-emerald-500/80">
            Main Menu
          </p>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex w-full items-center gap-3
                  rounded-xl px-3 py-3.5 text-left transition-all
                  duration-200 focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    isActive
                      ? 'bg-emerald-900 text-white shadow-md shadow-black/20 ring-1 ring-emerald-700/50'
                      : 'text-slate-400 hover:bg-emerald-950/70 hover:text-emerald-300'
                  }`}
              >
                {isActive && (
                  <span className="absolute inset-y-3 left-0 w-1
                    rounded-r-full bg-emerald-400" />
                )}

                <div className={`flex h-10 w-10 shrink-0 items-center
                  justify-center rounded-xl ${
                    isActive
                      ? 'bg-emerald-800 text-emerald-200'
                      : 'bg-white/5 text-slate-400'
                  }`}>
                  <Icon className="h-5 w-5" />
                </div>

                <span className={`text-sm ${
                  isActive ? 'font-semibold' : 'font-medium'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="border-t border-emerald-900/60 p-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="flex w-full items-center gap-3 rounded-xl
              px-3 py-3.5 text-sm font-medium text-slate-400
              transition-colors hover:bg-rose-950/50 hover:text-rose-300
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-rose-400"
          >
            <span className="flex h-10 w-10 items-center justify-center
              rounded-xl bg-white/5">
              <LogOut className="h-5 w-5" />
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;