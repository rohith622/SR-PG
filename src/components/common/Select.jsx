import React, { forwardRef } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

export const Select = forwardRef(
  (
    {
      label,
      name,
      id,
      value,
      onChange,
      options = [],
      placeholder = 'Select an option',
      error,
      helperText,
      required = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const selectId = id || name || `select-${Math.random().toString(36).slice(2, 7)}`;
    const hasError = Boolean(error);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label
            htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? `${selectId}-error` : undefined}
            className={`
              w-full min-h-[44px] appearance-none rounded-lg border bg-white px-3.5 py-2 pr-10 text-sm text-slate-900 transition-colors
              focus:outline-none focus:ring-2 focus:ring-offset-1
              disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500
              ${
                hasError
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-100'
              }
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              const optVal = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              const optDisabled = typeof opt === 'object' ? opt.disabled : false;
              return (
                <option key={optVal} value={optVal} disabled={optDisabled}>
                  {optLabel}
                </option>
              );
            })}
          </select>

          <div className="pointer-events-none absolute right-3 text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {hasError && (
          <div
            id={`${selectId}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-xs text-rose-600 mt-0.5"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="font-medium">{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
