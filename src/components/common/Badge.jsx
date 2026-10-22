import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    // Bed status variants
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    occupied: 'bg-blue-50 text-blue-700 border-blue-200',
    maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
    
    // Rent / Payment status variants
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    due: 'bg-amber-50 text-amber-700 border-amber-200',
    overdue: 'bg-rose-50 text-rose-700 border-rose-200',
    
    // Checkout / Stay status
    completed: 'bg-slate-100 text-slate-700 border-slate-200',
    refunded: 'bg-teal-50 text-teal-700 border-teal-200',
    adjusted: 'bg-purple-50 text-purple-700 border-purple-200',
    
    // Default
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const dotColors = {
    available: 'bg-emerald-500',
    occupied: 'bg-blue-500',
    maintenance: 'bg-amber-500',
    paid: 'bg-emerald-500',
    due: 'bg-amber-500',
    overdue: 'bg-rose-500',
    completed: 'bg-slate-400',
    refunded: 'bg-teal-500',
    adjusted: 'bg-purple-500',
    neutral: 'bg-slate-400',
    primary: 'bg-blue-500',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2',
  };

  const key = variant.toLowerCase();
  const selectedVariant = variantStyles[key] || variantStyles.neutral;
  const selectedDot = dotColors[key] || dotColors.neutral;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${selectedVariant} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${selectedDot}`} />}
      {children}
    </span>
  );
};

export default Badge;
