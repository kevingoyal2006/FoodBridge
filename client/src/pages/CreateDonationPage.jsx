import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, ArrowLeft, UtensilsCrossed, Sparkles } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Input, Select, Textarea } from '../components/common/Input';
import Button from '../components/common/Button';

export default function CreateDonationPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default deadline tomorrow 8 PM
  const defaultDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    foodCategory: 'Cooked Meals',
    foodType: 'vegetarian',
    quantity: '',
    unit: 'meals',
    pickupDeadline: defaultDeadline,
    storageInstructions: 'Keep refrigerated and consume before pickup deadline.',
    allergenInformation: '',
    pickupAddress: '',
    city: 'Central Metro',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numQty = parseFloat(formData.quantity);
    if (!numQty || numQty <= 0) {
      setError('Please provide a valid quantity greater than zero.');
      return;
    }

    if (new Date(formData.pickupDeadline) <= new Date()) {
      setError('Pickup deadline must be a future date and time.');
      return;
    }

    setLoading(true);
    try {
      const allergens = formData.allergenInformation
        ? formData.allergenInformation.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await apiClient.post('/donations', {
        ...formData,
        quantity: numQty,
        allergenInformation: allergens,
      });

      addToast('Surplus food donation successfully published!', 'success');
      navigate('/donor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to publish donation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Publish Surplus Food Donation"
      subtitle="Share details of excess food so verified organizations can quickly claim it before expiry."
      actions={
        <Link to="/donor/dashboard">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      }
    >
      <div className="max-w-2xl bg-white rounded-3xl border border-appBorder p-6 sm:p-10 shadow-card">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-status-rejected text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Donation Listing Title"
            id="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. 50 Fresh Vegetarian Lunch Bento Boxes"
            helperText="Clear descriptive title including food item name"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Food Category"
              id="foodCategory"
              value={formData.foodCategory}
              onChange={handleChange}
              options={[
                { value: 'Cooked Meals', label: 'Cooked Meals' },
                { value: 'Raw Groceries', label: 'Raw Groceries' },
                { value: 'Baked Goods', label: 'Baked Goods' },
                { value: 'Dairy & Produce', label: 'Dairy & Produce' },
                { value: 'Packaged Food', label: 'Packaged Food' },
                { value: 'Other', label: 'Other' },
              ]}
            />

            <Select
              label="Dietary / Food Classification"
              id="foodType"
              value={formData.foodType}
              onChange={handleChange}
              options={[
                { value: 'vegetarian', label: 'Vegetarian' },
                { value: 'non_vegetarian', label: 'Non-Vegetarian' },
                { value: 'vegan', label: 'Vegan' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Quantity Offered"
              id="quantity"
              type="number"
              step="any"
              min="1"
              required
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g. 50"
            />

            <Select
              label="Measurement Unit"
              id="unit"
              value={formData.unit}
              onChange={handleChange}
              options={[
                { value: 'meals', label: 'Meals (Portions)' },
                { value: 'kg', label: 'Kilograms (kg)' },
                { value: 'packets', label: 'Packets / Boxes' },
                { value: 'items', label: 'Individual Items' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Pickup Deadline (Must be in future)"
              id="pickupDeadline"
              type="datetime-local"
              required
              value={formData.pickupDeadline}
              onChange={handleChange}
              helperText="Date & time by which collection must occur"
            />

            <Input
              label="City / Region"
              id="city"
              required
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Central Metro, Sector 5"
            />
          </div>

          <Input
            label="Pickup Address (Exact collection location)"
            id="pickupAddress"
            required
            value={formData.pickupAddress}
            onChange={handleChange}
            placeholder="e.g. FreshBites Bistro Kitchen Rear Entrance, 124 Market Square"
            helperText="Shielded publicly; revealed only to verified parties after request approval."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Storage & Handling Instructions"
              id="storageInstructions"
              value={formData.storageInstructions}
              onChange={handleChange}
              placeholder="e.g. Keep refrigerated below 5°C."
            />

            <Input
              label="Known Allergens (Comma-separated)"
              id="allergenInformation"
              value={formData.allergenInformation}
              onChange={handleChange}
              placeholder="e.g. Gluten, Dairy, Peanuts"
              helperText="Comma separated list"
            />
          </div>

          <Textarea
            label="Additional Description & Food Notes"
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide context regarding preparation method, packaging containers, or dietary highlights."
          />

          <div className="pt-4 border-t border-appBorder flex items-center justify-end space-x-3">
            <Link to="/donor/dashboard">
              <Button variant="secondary" size="md">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" size="md" type="submit" loading={loading}>
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>Publish Listing</span>
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
