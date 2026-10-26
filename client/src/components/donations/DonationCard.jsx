import React from 'react';
import { Clock, MapPin, Package, Heart, Building2, Leaf } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

export default function DonationCard({
  donation,
  onViewDetails,
  onRequest,
  canRequest = false,
}) {
  const isExpired = new Date(donation.pickupDeadline) <= new Date();
  const deadlineStr = new Date(donation.pickupDeadline).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const foodTypeColor = {
    vegetarian: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    non_vegetarian: 'text-amber-800 bg-amber-50 border-amber-200',
    vegan: 'text-emerald-800 bg-emerald-100 border-emerald-300',
    other: 'text-slate-700 bg-slate-50 border-slate-200',
  }[donation.foodType] || 'text-slate-700 bg-slate-50 border-slate-200';

  return (
    <div className="bg-white rounded-2xl border border-appBorder p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-forest/5 text-forest border border-forest/10 truncate">
            {donation.foodCategory}
          </span>
          <StatusBadge status={isExpired ? 'expired' : donation.status} />
        </div>

        {/* Title */}
        <div>
          <h3 className="font-bold text-forest text-base group-hover:text-primary transition-colors line-clamp-1">
            {donation.title}
          </h3>
          <p className="text-xs text-secText flex items-center space-x-1 mt-1 truncate">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>{donation.donorId?.organizationName || donation.donorId?.name || 'Surplus Donor'}</span>
          </p>
        </div>

        {/* Quantity & Food Type Pill */}
        <div className="flex items-center space-x-2 pt-1">
          <div className="px-3 py-1 rounded-xl bg-warm-cream border border-amber-200/60 text-xs font-bold text-amber-900 flex items-center space-x-1">
            <Package className="w-3.5 h-3.5 text-amber-700" />
            <span>
              {donation.quantityAvailable} / {donation.quantity} {donation.unit}
            </span>
          </div>

          <div className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border flex items-center space-x-1 ${foodTypeColor}`}>
            <Leaf className="w-3 h-3" />
            <span className="capitalize">{donation.foodType.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Deadline & Location */}
        <div className="space-y-1.5 pt-2 text-xs text-secText border-t border-appBorder">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Pickup by: <strong className="text-mainText font-semibold">{deadlineStr}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{donation.pickupAddress || donation.city}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-appBorder flex items-center space-x-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onViewDetails(donation)}
        >
          View Details
        </Button>

        {canRequest && donation.status === 'available' && !isExpired && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onRequest(donation)}
          >
            Claim Food
          </Button>
        )}
      </div>
    </div>
  );
}
