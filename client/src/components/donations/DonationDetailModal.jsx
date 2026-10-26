import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { Package, Clock, MapPin, AlertTriangle, ShieldCheck, Building2, Phone } from 'lucide-react';

export default function DonationDetailModal({
  isOpen,
  onClose,
  donation,
  onRequest,
  canRequest,
}) {
  if (!donation) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Food Donation Details" maxWidth="max-w-xl">
      <div className="space-y-6 text-sm">
        {/* Title and Badges */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-forest/10 text-forest">
              {donation.foodCategory}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
              {donation.foodType?.replace('_', ' ')}
            </span>
            <StatusBadge status={donation.status} />
          </div>
          <h2 className="text-xl font-extrabold text-forest">{donation.title}</h2>
          {donation.description && (
            <p className="text-secText leading-relaxed">{donation.description}</p>
          )}
        </div>

        {/* Quantity Card */}
        <div className="p-4 rounded-xl bg-warm-cream border border-amber-200/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-secText">Surplus Offered</div>
            <div className="text-2xl font-bold text-amber-900 mt-0.5">
              {donation.quantityAvailable} {donation.unit}
              <span className="text-xs font-normal text-secText ml-2">
                (Total: {donation.quantity} {donation.unit})
              </span>
            </div>
          </div>
          <Package className="w-8 h-8 text-amber-600/60" />
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-appBorder space-y-1">
            <div className="text-xs font-semibold text-secText flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-forest" />
              <span>Pickup Deadline</span>
            </div>
            <div className="font-semibold text-mainText">
              {new Date(donation.pickupDeadline).toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-appBorder space-y-1">
            <div className="text-xs font-semibold text-secText flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-forest" />
              <span>Donor Organization</span>
            </div>
            <div className="font-semibold text-mainText truncate">
              {donation.donorId?.organizationName || donation.donorId?.name || 'Verified Donor'}
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="p-4 rounded-xl bg-slate-50 border border-appBorder space-y-2">
          <div className="text-xs font-semibold text-secText flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-forest" />
            <span>Pickup Address & Location</span>
          </div>
          <div className="font-medium text-mainText">
            {donation.pickupAddress}
          </div>
          {donation.donorId?.phone && (
            <div className="text-xs text-secText flex items-center space-x-1.5 pt-1">
              <Phone className="w-3.5 h-3.5 text-forest" />
              <span>Contact: {donation.donorId.phone}</span>
            </div>
          )}
        </div>

        {/* Storage & Allergens */}
        <div className="space-y-3">
          {donation.storageInstructions && (
            <div>
              <span className="text-xs font-semibold uppercase text-secText">Storage Instructions:</span>
              <p className="text-mainText text-xs mt-0.5">{donation.storageInstructions}</p>
            </div>
          )}

          {donation.allergenInformation?.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase text-secText flex items-center space-x-1 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Allergen Notice:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {donation.allergenInformation.map((allergen, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-appBorder flex items-center justify-end space-x-3">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
          {canRequest && donation.status === 'available' && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                onRequest(donation);
              }}
            >
              Request Food Claim
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
