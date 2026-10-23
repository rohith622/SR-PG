import React from 'react';
import { ChevronRight } from 'lucide-react';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = null,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col gap-4 border-b border-emerald-100 pb-6 mb-6 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {/* Title & Breadcrumbs */}
      <div className="min-w-0">
        {breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-2 flex flex-wrap items-center gap-1.5 text-xs"
          >
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-emerald-700/50" />
                )}

                {crumb.onClick ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="font-medium text-slate-500 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-sm"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="font-semibold text-emerald-800">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-start gap-3">
          <div className="mt-1 h-8 w-1 shrink-0 rounded-full bg-emerald-800 sm:h-9" />

          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Header Actions */}
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;