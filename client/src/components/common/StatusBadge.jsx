import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  const normalized = (status || '').toLowerCase().replace(/\s+/g, '_');

  const configs = {
    // Success (#15803D)
    available: { label: 'Available', bg: 'bg-status-success-bg', text: 'text-status-success', border: 'border-status-success-border' },
    approved: { label: 'Approved', bg: 'bg-status-success-bg', text: 'text-status-success', border: 'border-status-success-border' },
    delivered: { label: 'Delivered', bg: 'bg-status-success-bg', text: 'text-status-success', border: 'border-status-success-border' },
    completed: { label: 'Completed', bg: 'bg-status-success-bg', text: 'text-status-success', border: 'border-status-success-border' },
    verified: { label: 'Verified', bg: 'bg-status-success-bg', text: 'text-status-success', border: 'border-status-success-border' },
    active: { label: 'Active', bg: 'bg-status-success-bg', text: 'text-status-success', border: 'border-status-success-border' },

    // Pending (#B45309)
    pending: { label: 'Pending Approval', bg: 'bg-status-pending-bg', text: 'text-status-pending', border: 'border-status-pending-border' },
    reserved: { label: 'Reserved', bg: 'bg-status-pending-bg', text: 'text-status-pending', border: 'border-status-pending-border' },
    partially_reserved: { label: 'Partially Claimed', bg: 'bg-status-pending-bg', text: 'text-status-pending', border: 'border-status-pending-border' },
    assigned: { label: 'Assigned', bg: 'bg-status-pending-bg', text: 'text-status-pending', border: 'border-status-pending-border' },
    in_fulfillment: { label: 'In Transit', bg: 'bg-status-pending-bg', text: 'text-status-pending', border: 'border-status-pending-border' },
    picked_up: { label: 'Collected / In Transit', bg: 'bg-status-pending-bg', text: 'text-status-pending', border: 'border-status-pending-border' },

    // Rejected / Cancelled (#B91C1C)
    rejected: { label: 'Rejected', bg: 'bg-status-rejected-bg', text: 'text-status-rejected', border: 'border-status-rejected-border' },
    cancelled: { label: 'Cancelled', bg: 'bg-status-rejected-bg', text: 'text-status-rejected', border: 'border-status-rejected-border' },
    expired: { label: 'Expired', bg: 'bg-status-rejected-bg', text: 'text-status-rejected', border: 'border-status-rejected-border' },
    suspended: { label: 'Suspended', bg: 'bg-status-rejected-bg', text: 'text-status-rejected', border: 'border-status-rejected-border' },
    failed: { label: 'Failed', bg: 'bg-status-rejected-bg', text: 'text-status-rejected', border: 'border-status-rejected-border' },

    // Informational (#1D4ED8)
    draft: { label: 'Draft', bg: 'bg-status-info-bg', text: 'text-status-info', border: 'border-status-info-border' },
    unassigned: { label: 'Needs Volunteer', bg: 'bg-status-info-bg', text: 'text-status-info', border: 'border-status-info-border' },
    not_required: { label: 'Not Required', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  };

  const current = configs[normalized] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {current.label}
    </span>
  );
}
