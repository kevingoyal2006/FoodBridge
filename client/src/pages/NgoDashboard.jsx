import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert, 
  Package, 
  MapPin, 
  Phone 
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

export default function NgoDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNgoData = async () => {
    setLoading(true);
    try {
      const [sumRes, reqRes] = await Promise.all([
        apiClient.get('/dashboard/summary'),
        apiClient.get('/requests/my'),
      ]);
      setSummary(sumRes.data.metrics);
      setRequests(reqRes.data.requests || []);
    } catch (err) {
      console.error('Failed to load NGO dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgoData();
  }, []);

  const isVerified = user?.verificationStatus === 'verified';

  return (
    <DashboardLayout
      title="NGO Recipient Dashboard"
      subtitle="Track your surplus food claims, verify delivery status, and discover local donations."
      actions={
        <Link to="/donations">
          <Button variant="primary" size="md">
            <Search className="w-4 h-4 mr-1.5" />
            <span>Browse Surplus Food</span>
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Verification Status Banner */}
        {isVerified ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-status-success-border flex items-center justify-between text-forest text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-status-success-bg text-status-success flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <strong className="font-bold text-status-success">Organization Verified:</strong> {user.organizationName || user.name}
                <div className="text-xs text-secText">
                  Registration ID: {user.registrationNumber || 'Verified by Central Administration'}
                </div>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs font-bold text-status-success bg-white px-3 py-1 rounded-full border border-status-success-border">
              Claim Permissions Active
            </span>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-2">
            <div className="flex items-center space-x-2 font-bold text-amber-800">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>Administrative Verification Pending</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Your NGO account credentials are currently queued for administrative review. To maintain safety and trust in the redistribution network, an administrator will verify your organization ID before claims can be submitted. You may browse all available listings in the meantime.
            </p>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Food Claims"
            value={summary?.totalRequests ?? 0}
            subtext="All submitted requests"
            icon={Package}
            variant="default"
          />
          <StatCard
            title="Pending Requests"
            value={summary?.pendingRequests ?? 0}
            subtext="Awaiting donor review"
            icon={Clock}
            variant="amber"
          />
          <StatCard
            title="Approved & In Transit"
            value={summary?.approvedRequests ?? 0}
            subtext="Logistics in progress"
            icon={Building2}
            variant="primary"
          />
          <StatCard
            title="Delivered & Distributed"
            value={summary?.deliveredRequests ?? 0}
            subtext="Completed handovers"
            icon={CheckCircle2}
            variant="lime"
          />
        </div>

        {/* My Requests Table */}
        <div className="bg-white rounded-2xl border border-appBorder shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-appBorder flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-forest">My Food Claim History</h2>
              <p className="text-xs text-secText">Track status, collection addresses, and pickup notes for all requests.</p>
            </div>
          </div>

          <div className="p-6">
            {requests.length === 0 ? (
              <EmptyState
                title="No food claims submitted yet"
                description="Explore active surplus food listings published in your area and submit a request to source meals."
                actionLabel="Browse Available Food"
                onAction={() => window.location.href = '/donations'}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-appBorder text-xs uppercase tracking-wider text-secText bg-slate-50/60">
                      <th className="py-3 px-4">Donation Listing</th>
                      <th className="py-3 px-4">Donor Contact</th>
                      <th className="py-3 px-4">Claim Quantity</th>
                      <th className="py-3 px-4">Pickup Location</th>
                      <th className="py-3 px-4">Request Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-appBorder">
                    {requests.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-mainText">
                          <div>{r.donationId?.title || 'Food Listing'}</div>
                          <div className="text-xs text-secText font-normal">
                            Category: {r.donationId?.foodCategory}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs text-secText">
                          <div className="font-semibold text-mainText">
                            {r.donationId?.donorId?.organizationName || r.donationId?.donorId?.name || 'Donor'}
                          </div>
                          {r.donationId?.donorId?.phone && (
                            <div className="flex items-center space-x-1 mt-0.5 text-forest font-mono">
                              <Phone className="w-3 h-3" />
                              <span>{r.donationId.donorId.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 font-bold text-forest">
                          {r.requestedQuantity} {r.donationId?.unit}
                        </td>
                        <td className="py-4 px-4 text-xs text-secText max-w-xs">
                          <div className="flex items-start space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                            <span>{r.donationId?.pickupAddress}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
