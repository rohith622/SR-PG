import React, { useEffect, useRef } from 'react';
import { X, Building2, RotateCcw, LogOut } from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';

export const MobileDrawer = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onResetData,
  onSignOut,
  propertyInfo,
}) => {
  const drawerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      // Focus first nav item
      setTimeout(() => {
        if (drawerRef.current) {
          const firstFocusable = drawerRef.current.querySelector('button');
          if (firstFocusable) firstFocusable.focus();
        }
      }, 50);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation drawer"
      className="fixed inset-0 z-50 lg:hidden flex"
    >
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel sliding from left */}
      <div
        ref={drawerRef}
        className="relative z-10 w-[280px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between animate-slideInLeft"
      >
        {/* Top Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {propertyInfo?.name || 'SR PG Living'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                Property Portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
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
                className={`
                  w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all text-left
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{item.label}</p>
                  <p className="text-[11px] text-slate-400 font-normal">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Drawer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onResetData();
              onClose();
            }}
            className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-200/50 w-full text-left"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="flex items-center gap-2 text-xs font-medium text-rose-600 p-2 rounded-lg hover:bg-rose-50 w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
