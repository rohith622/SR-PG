import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'info', duration = 4000 }) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (message, title = 'Success') => addToast({ title, message, type: 'success' }),
    error: (message, title = 'Error') => addToast({ title, message, type: 'error', duration: 5500 }),
    info: (message, title = 'Information') => addToast({ title, message, type: 'info' }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => {
          const typeConfig = {
            success: {
              icon: CheckCircle2,
              bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
              iconColor: 'text-emerald-600',
            },
            error: {
              icon: AlertCircle,
              bg: 'bg-rose-50 border-rose-200 text-rose-900',
              iconColor: 'text-rose-600',
            },
            info: {
              icon: Info,
              bg: 'bg-blue-50 border-blue-200 text-blue-900',
              iconColor: 'text-blue-600',
            },
          };

          const config = typeConfig[t.type] || typeConfig.info;
          const Icon = config.icon;

          return (
            <div
              key={t.id}
              role="alert"
              className={`
                pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-xs transition-all duration-300
                ${config.bg}
              `}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
              <div className="flex-1 min-w-0">
                {t.title && <p className="text-xs font-semibold">{t.title}</p>}
                <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 p-1 -mr-1 -mt-1 rounded-md"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default useToast;
