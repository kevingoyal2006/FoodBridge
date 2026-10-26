import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Building2,
  Calendar,
  UtensilsCrossed,
  Layers,
  Inbox
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

export default function DonorDashboard() {
  const [summary, setSummary] = useState(null);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'requests'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, donRes] = await Promise.all([
        apiClient.get('/dashboard/summary'),
        apiClient.get('/donations/my'),
      ]);
      setSummary(sumRes.data.metrics);
      setDonations(donRes.data.donations);

      // Fetch requests for all active donations
      const allRequests = [];
      for (const d of donRes.data.donations) {
        try {
          const reqRes = await apiClient.get(`/donations/${d._id}/requests`);
          if (reqRes.data.requests?.length > 0) {
            allRequests.push(...reqRes.data.requests.map((r) => ({ ...r, donation: d })));
          }
        } catch (e) {
          // ignore
        }
      }
      setRequests(allRequests);
    } catch (err) {
      addToast('Failed to load donor dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Approve NGO request (triggers atomic backend reservation)
  const handleApproveRequest = async (requestId) => {
    setActionLoading(requestId);
    try {
      await apiClient.patch(`/requests/${requestId}/approve`);
      addToast('Request approved! Quantity reserved and volunteer mission activated.', 'success');
      await fetchData();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to approve request.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Reject NGO request
  const handleRejectRequest = async (requestId) => {
    setActionLoading(requestId);
    try {
      await apiClient.patch(`/requests/${requestId}/reject`);
      addToast('Request rejected.', 'info');
      await fetchData();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to reject request.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel donation
  const handleCancelDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to cancel this surplus food listing?')) return;
    try {
      await apiClient.patch(`/donations/${donationId}/cancel`);
      addToast('Donation listing cancelled.', 'info');
      await fetchData();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to cancel donation.', 'error');
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <DashboardLayout
      title="Donor Dashboard"
      subtitle="Publish surplus food, review recipient requests, and coordinate pickups."
      actions={
        <Link to="/donor/create">
          <Button variant="primary" size="md">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Donate Surplus Food</span>
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Listings"
            value={summary?.totalPosted ?? 0}
            subtext="All time surplus listings"
            icon={Package}
            variant="default"
          />
          <StatCard
            title="Active Available"
            value={summary?.activeListings ?? 0}
            subtext="Awaiting claims"
            icon={UtensilsCrossed}
            variant="primary"
          />
          <StatCard
            title="Completed Deliveries"
            value={summary?.completedDonations ?? 0}
            subtext="Delivered to community"
            icon={CheckCircle2}
            variant="lime"
          />
          <StatCard
            title="Pending Requests"
            value={pendingRequests.length}
            subtext="Awaiting your approval"
            icon={Inbox}
            variant="amber"
          />
        </div>

        {/* Tab Controls */}
        <div className="bg-white rounded-2xl border border-appBorder shadow-subtle overflow-hidden">
          <div className="flex border-b border-appBorder bg-slate-50/50">
            <button
              onClick={() => setActiveTab('listings')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'listings'
                  ? 'border-forest text-forest bg-white'
                  : 'border-transparent text-secText hover:text-mainText'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Surplus Listings ({donations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'requests'
                  ? 'border-forest text-forest bg-white'
                  : 'border-transparent text-secText hover:text-mainText'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Received NGO Requests</span>
              {pendingRequests.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-status-pending-bg text-status-pending border border-status-pending-border font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>

          <div className="p-6">
            {/* Tab 1: Listings */}
            {activeTab === 'listings' && (
              donations.length === 0 ? (
                <EmptyState
                  title="No food listings published yet"
                  description="When you have surplus meals or grocery items, publish a listing to connect with verified NGOs."
                  actionLabel="Publish First Donation"
                  onAction={() => window.location.href = '/donor/create'}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-appBorder text-xs uppercase tracking-wider text-secText bg-slate-50/60">
                        <th className="py-3 px-4">Title & Details</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Quantity Available</th>
                        <th className="py-3 px-4">Pickup Deadline</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-appBorder">
                      {donations.map((d) => (
                        <tr key={d._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4 font-semibold text-mainText">
                            <div>{d.title}</div>
                            <div className="text-xs text-secText font-normal capitalize">
                              {d.foodType.replace('_', ' ')} · {d.city}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-secText">{d.foodCategory}</td>
                          <td className="py-4 px-4 font-bold text-forest">
                            {d.quantityAvailable} / {d.quantity} {d.unit}
                          </td>
                          <td className="py-4 px-4 text-secText text-xs">
                            {new Date(d.pickupDeadline).toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <StatusBadge status={d.status} />
                          </td>
                          <td className="py-4 px-4 text-right">
                            {['draft', 'available'].includes(d.status) && (
                              <button
                                onClick={() => handleCancelDonation(d._id)}
                                className="text-xs font-semibold text-status-rejected hover:underline"
                              >
                                Cancel Listing
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Tab 2: Requests */}
            {activeTab === 'requests' && (
              requests.length === 0 ? (
                <EmptyState
                  title="No requests received yet"
                  description="When verified NGOs request portions of your active listings, they will appear here for your approval."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-appBorder text-xs uppercase tracking-wider text-secText bg-slate-50/60">
                        <th className="py-3 px-4">Requesting NGO</th>
                        <th className="py-3 px-4">Food Listing</th>
                        <th className="py-3 px-4">Claim Quantity</th>
                        <th className="py-3 px-4">Notes</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Review Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-appBorder">
                      {requests.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-bold text-mainText">
                              {r.ngoId?.organizationName || r.ngoId?.name || 'NGO Recipient'}
                            </div>
                            <div className="text-xs text-secText">
                              Reg ID: {r.ngoId?.registrationNumber || 'Verified'}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-medium text-forest">
                            {r.donation?.title}
                          </td>
                          <td className="py-4 px-4 font-bold text-mainText">
                            {r.requestedQuantity} {r.donation?.unit}
                          </td>
                          <td className="py-4 px-4 text-xs text-secText max-w-xs truncate">
                            {r.pickupNotes || 'None provided'}
                          </td>
                          <td className="py-4 px-4">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="py-4 px-4 text-right">
                            {r.status === 'pending' ? (
                              <div className="inline-flex space-x-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  loading={actionLoading === r._id}
                                  onClick={() => handleApproveRequest(r._id)}
                                >
                                  Approve & Reserve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  loading={actionLoading === r._id}
                                  onClick={() => handleRejectRequest(r._id)}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-secText font-medium">Reviewed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
