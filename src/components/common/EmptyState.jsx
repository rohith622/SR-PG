import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white/70 ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          icon={actionIcon}
          variant="primary"
          size="md"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
