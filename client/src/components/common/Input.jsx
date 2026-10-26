import React from 'react';

export function Input({
  label,
  id,
  type = 'text',
  error,
  helperText,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-secText">
          {label} {required && <span className="text-status-rejected">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        required={required}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-mainText placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
          error ? 'border-status-rejected bg-red-50/20' : 'border-appBorder hover:border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-status-rejected font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-secText">{helperText}</p>}
    </div>
  );
}

export function Select({
  label,
  id,
  options = [],
  error,
  helperText,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-secText">
          {label} {required && <span className="text-status-rejected">*</span>}
        </label>
      )}
      <select
        id={id}
        required={required}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-mainText transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
          error ? 'border-status-rejected' : 'border-appBorder hover:border-slate-300'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-status-rejected font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-secText">{helperText}</p>}
    </div>
  );
}

export function Textarea({
  label,
  id,
  rows = 3,
  error,
  helperText,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-secText">
          {label} {required && <span className="text-status-rejected">*</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        required={required}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-mainText placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y ${
          error ? 'border-status-rejected' : 'border-appBorder hover:border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-status-rejected font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-secText">{helperText}</p>}
    </div>
  );
}

export default { Input, Select, Textarea };
