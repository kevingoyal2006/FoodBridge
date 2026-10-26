import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No items found',
  description = 'There are no records to display at this time.',
  icon: Icon = PackageOpen,
  actionLabel,
  onAction,
}) {
  return (
    <div className="text-center py-12 px-4 rounded-2xl bg-white border border-dashed border-appBorder">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-forest/5 flex items-center justify-center text-forest mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-forest">{title}</h3>
      <p className="text-sm text-secText max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
