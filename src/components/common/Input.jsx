import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export const Input = forwardRef(
  (
    {
      label,
      name,
      id,
      type = 'text',
      value,
      onChange,
      placeholder,
      error,
      helperText,
      required = false,
      disabled = false,
      icon: Icon,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || name || `input-${Math.random().toString(36).slice(2, 7)}`;
    const hasError = Boolean(error);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
            </span>
            {helperText && !error && (
              <span className="text-slate-400 font-normal lowercase tracking-normal text-[11px]">
                {helperText}
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? `${inputId}-error` : undefined}
            className={`
              w-full min-h-[44px] rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors
              placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1
              disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500
              ${Icon ? 'pl-10' : ''}
              ${
                hasError
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-100'
              }
            `}
            {...props}
          />
        </div>

        {hasError && (
          <div
            id={`${inputId}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-xs text-rose-600 mt-0.5 animate-fadeIn"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="font-medium">{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
