import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  className = '',
}) {
  const iconVariants = {
    default: 'bg-forest/10 text-forest',
    primary: 'bg-primary/10 text-primary',
    lime: 'bg-soft-lime text-forest',
    amber: 'bg-status-pending-bg text-status-pending',
    blue: 'bg-status-info-bg text-status-info',
  };

  return (
    <div className={`bg-white rounded-2xl border border-appBorder p-6 shadow-subtle hover:shadow-card transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-secText">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconVariants[variant] || iconVariants.default}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-extrabold text-forest tracking-tight">{value}</div>
        {subtext && <div className="text-xs text-secText mt-1.5 font-medium">{subtext}</div>}
      </div>
    </div>
  );
}
