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
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80 mb-6 ${className}`}
    >
      <div>
        {breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5"
          >
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                {crumb.onClick ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="hover:text-blue-600 transition-colors font-medium text-slate-600"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="font-semibold text-slate-800">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
