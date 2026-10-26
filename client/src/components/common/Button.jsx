import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variants = {
    // Primary Green: primary buttons, links, active states
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-sm focus:ring-primary',
    // Forest Green: navbar, brand elements, prominent actions
    forest: 'bg-forest hover:bg-forest-950 text-white shadow-sm focus:ring-forest',
    // Secondary: clean white background with subtle border
    secondary: 'bg-white hover:bg-slate-50 text-mainText border border-appBorder shadow-subtle focus:ring-primary',
    // Soft Lime: highlights and accents
    softLime: 'bg-soft-lime hover:bg-soft-lime-hover text-forest font-semibold shadow-subtle focus:ring-soft-lime',
    // Destructive: red for cancellations / rejections
    destructive: 'bg-status-rejected hover:bg-red-800 text-white shadow-sm focus:ring-status-rejected',
    // Ghost
    ghost: 'bg-transparent hover:bg-slate-100 text-secText hover:text-mainText focus:ring-slate-300',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 space-x-1.5',
    md: 'text-sm px-4 py-2.5 space-x-2',
    lg: 'text-base px-6 py-3 space-x-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      <span>{children}</span>
    </button>
  );
}
