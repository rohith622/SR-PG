import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 focus:ring-blue-500 border border-transparent',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-slate-400',
    outline:
      'bg-transparent hover:bg-blue-50 text-blue-600 border border-blue-300 focus:ring-blue-500',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 focus:ring-rose-500 border border-transparent',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 focus:ring-slate-400 border border-transparent',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 focus:ring-emerald-500 border border-transparent',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2 min-h-[44px] gap-2', // ensures 44px min touch target
    lg: 'text-base px-5 py-2.5 min-h-[48px] gap-2.5',
    icon: 'p-2.5 min-h-[44px] min-w-[44px] justify-center',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
