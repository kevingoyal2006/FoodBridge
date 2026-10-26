import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { Package, ShieldCheck } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export default function RequestDonationModal({
  isOpen,
  onClose,
  donation,
  onSuccess,
}) {
  const [quantity, setQuantity] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  if (!donation) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numQty = parseFloat(quantity);
    if (!numQty || numQty <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }

    if (numQty > donation.quantityAvailable) {
      setError(`Cannot request more than available surplus (${donation.quantityAvailable} ${donation.unit}).`);
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/donations/${donation._id}/requests`, {
        requestedQuantity: numQty,
        pickupNotes,
      });

      addToast(`Claim submitted for ${numQty} ${donation.unit}! The donor has been notified.`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit food claim.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Surplus Food" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-warm-cream border border-amber-200/60 text-xs text-amber-900 flex items-center space-x-2">
          <Package className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            Claiming: <strong className="font-bold">{donation.title}</strong>
            <div>Available: <strong>{donation.quantityAvailable} {donation.unit}</strong></div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-status-rejected text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <Input
          label={`Requested Quantity (${donation.unit})`}
          id="reqQuantity"
          type="number"
          step="any"
          required
          min="1"
          max={donation.quantityAvailable}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={`e.g. ${donation.quantityAvailable}`}
          helperText={`Enter a quantity up to ${donation.quantityAvailable} ${donation.unit}`}
        />

        <Textarea
          label="Pickup / Coordination Notes (Optional)"
          id="pickupNotes"
          value={pickupNotes}
          onChange={(e) => setPickupNotes(e.target.value)}
          placeholder="e.g. We have sanitized thermal bags and our team can collect between 2 PM and 4 PM."
          rows={3}
        />

        <div className="pt-4 border-t border-appBorder flex items-center justify-end space-x-3">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" loading={loading}>
            Submit Food Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
