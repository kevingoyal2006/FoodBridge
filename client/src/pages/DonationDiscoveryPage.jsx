import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import DonationCard from '../components/donations/DonationCard';
import DonationDetailModal from '../components/donations/DonationDetailModal';
import RequestDonationModal from '../components/donations/RequestDonationModal';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';

export default function DonationDiscoveryPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [foodType, setFoodType] = useState('All');

  // Modals state
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const categories = ['All', 'Cooked Meals', 'Raw Groceries', 'Baked Goods', 'Dairy & Produce', 'Packaged Food'];

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (foodType !== 'All') params.foodType = foodType;
      if (search.trim()) params.search = search.trim();

      const response = await apiClient.get('/donations', { params });
      setDonations(response.data.donations || []);
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [category, foodType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  const handleOpenDetail = (d) => {
    setSelectedDonation(d);
    setDetailModalOpen(true);
  };

  const handleOpenRequest = (d) => {
    setSelectedDonation(d);
    setRequestModalOpen(true);
  };

  const isVerifiedNgo = user?.role === 'ngo' && user?.verificationStatus === 'verified';
  const isPendingNgo = user?.role === 'ngo' && user?.verificationStatus === 'pending';

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-1 border-b border-appBorder pb-4">
          <h1 className="text-3xl font-extrabold text-forest">Browse Surplus Food Donations</h1>
          <p className="text-sm text-secText">
            Explore active surplus food listings published by local bakeries, caterers, and restaurants.
          </p>
        </div>

        {/* Verification Alert for NGOs */}
        {isPendingNgo && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-amber-900 text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Organization Verification Pending:</strong> Your NGO account is currently in verification review by our administration. You can browse active listings, but claiming food requires verification approval.
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-appBorder p-5 shadow-subtle space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-secText absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by food title, city, or description..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="All">All Dietary Types</option>
              <option value="vegetarian">Vegetarian Only</option>
              <option value="non_vegetarian">Non-Vegetarian</option>
              <option value="vegan">Vegan Only</option>
            </select>

            <Button variant="primary" size="md" type="submit">
              Search
            </Button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-appBorder">
            <span className="text-xs font-bold text-secText uppercase tracking-wider mr-1">Categories:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  category === cat
                    ? 'bg-forest text-soft-lime shadow-subtle'
                    : 'bg-slate-50 text-secText hover:bg-slate-100 hover:text-mainText border border-appBorder'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listing Grid */}
        {loading ? (
          <div className="text-center py-16 text-secText space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-primary" />
            <p className="text-sm font-semibold">Loading available surplus donations...</p>
          </div>
        ) : donations.length === 0 ? (
          <EmptyState
            title="No surplus food listings match your criteria"
            description="Try clearing your filters or search term to see more active community donations."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch('');
              setCategory('All');
              setFoodType('All');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((d) => (
              <DonationCard
                key={d._id}
                donation={d}
                onViewDetails={handleOpenDetail}
                onRequest={handleOpenRequest}
                canRequest={isVerifiedNgo}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <DonationDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        donation={selectedDonation}
        onRequest={handleOpenRequest}
        canRequest={isVerifiedNgo}
      />

      <RequestDonationModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        donation={selectedDonation}
        onSuccess={fetchDonations}
      />
    </div>
  );
}
