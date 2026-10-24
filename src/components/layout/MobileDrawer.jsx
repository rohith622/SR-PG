
import React, { useEffect, useRef } from 'react';
import {
  X,
  Building2,
  LogOut,
  ChevronRight,
} from 'lucide-react';
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

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="relative z-10 flex h-full w-[290px] max-w-[88vw] flex-col border-r border-[#d7b76c]/20 bg-gradient-to-b from-[#103b2c] via-[#0c3225] to-[#08271d] text-white shadow-2xl"
      >
        {/* Brand header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-5">
          <button
            type="button"
            onClick={() => {
              onSelectTab('dashboard');
              onClose();
            }}
            className="flex min-w-0 items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b76c]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d7b76c]/40 bg-[#d7b76c]/10">
              <Building2 className="h-5 w-5 text-[#e8cd8b]" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold tracking-tight text-white">
                {propertyInfo?.name || 'SR PG Living'}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#e8cd8b]">
                Property Management
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-emerald-100/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b76c]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 space-y-2 overflow-y-auto px-3 py-6"
          aria-label="Mobile navigation"
        >
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/50">
            Workspace
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
                className={`group relative flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b76c] ${
                  isActive
                    ? 'border-[#d7b76c]/25 bg-gradient-to-r from-[#d7b76c]/20 to-[#d7b76c]/5 text-[#f4dfa7]'
                    : 'border-transparent text-emerald-100/70 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-[#e3c477]" />
                )}

                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isActive
                      ? 'bg-[#d7b76c]/15 text-[#e8cd8b]'
                      : 'bg-white/[0.05] text-emerald-100/65 group-hover:text-[#e8cd8b]'
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>

                <span className={`min-w-0 flex-1 text-sm ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}>
                  {item.label}
                </span>

                {isActive && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#e8cd8b]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Property footer */}
        <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-black/10 p-3">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-4 w-4 shrink-0 text-[#e8cd8b]" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {propertyInfo?.name || 'SR PG Living'}
              </p>
              <p className="mt-0.5 text-[10px] text-emerald-100/55">
                Property workspace
              </p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-emerald-100/70 transition-colors hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Sign Out</span>
          </button>

          <p className="mt-3 text-center text-[10px] tracking-wide text-emerald-100/35">
            SR PG Living · Property Suite
          </p>
        </div>
      </aside>
    </div>
  );
};

export default MobileDrawer;
