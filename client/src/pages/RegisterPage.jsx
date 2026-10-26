import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, UserPlus, Building2, Utensils, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input, Select, Textarea } from '../components/common/Input';
import Button from '../components/common/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor',
    organizationName: '',
    registrationNumber: '',
    phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.role === 'ngo' && !formData.organizationName) {
      setError('Organization name is required for NGO accounts.');
      return;
    }

    setLoading(true);
    try {
      const data = await register(formData);
      addToast(`Account registered successfully as ${data.user.role}!`, 'success');

      switch (data.user.role) {
        case 'donor': navigate('/donor/dashboard'); break;
        case 'ngo': navigate('/ngo/dashboard'); break;
        case 'volunteer': navigate('/volunteer/dashboard'); break;
        default: navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-appBorder shadow-card">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-forest text-soft-lime flex items-center justify-center font-bold shadow-sm">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-forest tracking-tight">
            Create Your FoodBridge Account
          </h2>
          <p className="text-xs text-secText">
            Join the community food redistribution network.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-status-rejected text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-secText mb-2">
              Select Your Role <span className="text-status-rejected">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('donor')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  formData.role === 'donor'
                    ? 'border-forest bg-forest text-white shadow-subtle'
                    : 'border-appBorder bg-slate-50 text-secText hover:bg-slate-100'
                }`}
              >
                <Utensils className={`w-5 h-5 mx-auto mb-1 ${formData.role === 'donor' ? 'text-soft-lime' : 'text-forest'}`} />
                <span className="text-xs font-bold block">Food Donor</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('ngo')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  formData.role === 'ngo'
                    ? 'border-forest bg-forest text-white shadow-subtle'
                    : 'border-appBorder bg-slate-50 text-secText hover:bg-slate-100'
                }`}
              >
                <Building2 className={`w-5 h-5 mx-auto mb-1 ${formData.role === 'ngo' ? 'text-soft-lime' : 'text-forest'}`} />
                <span className="text-xs font-bold block">Recipient NGO</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('volunteer')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  formData.role === 'volunteer'
                    ? 'border-forest bg-forest text-white shadow-subtle'
                    : 'border-appBorder bg-slate-50 text-secText hover:bg-slate-100'
                }`}
              >
                <Truck className={`w-5 h-5 mx-auto mb-1 ${formData.role === 'volunteer' ? 'text-soft-lime' : 'text-forest'}`} />
                <span className="text-xs font-bold block">Volunteer</span>
              </button>
            </div>

            {formData.role === 'ngo' && (
              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-xl mt-2 leading-relaxed">
                ℹ️ <strong>Note for NGOs:</strong> New NGO registrations start in a pending verification status. An administrator will verify your organization details before food requests can be submitted.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person Name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Marcus Vance"
            />

            <Input
              label="Email Address"
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@organization.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              helperText="Must be at least 6 characters"
            />

            <Input
              label="Phone Number"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 555-0123"
            />
          </div>

          {formData.role !== 'volunteer' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={formData.role === 'ngo' ? 'NGO / Organization Name *' : 'Business / Organization Name'}
                id="organizationName"
                required={formData.role === 'ngo'}
                value={formData.organizationName}
                onChange={handleChange}
                placeholder={formData.role === 'ngo' ? 'CareFeed Foundation' : 'FreshBites Bakery'}
              />

              {formData.role === 'ngo' && (
                <Input
                  label="Registration / Trust ID"
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g. NGO-DARPAN-2024"
                  helperText="Required for NGO verification audit"
                />
              )}
            </div>
          )}

          <Textarea
            label="Location / Address"
            id="address"
            rows={2}
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address, city, and postal code"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full mt-4"
          >
            <span>Complete Registration</span>
            <UserPlus className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="text-center text-xs text-secText pt-2">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
