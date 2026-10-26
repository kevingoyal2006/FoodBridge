import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ClipboardCheck, 
  Building2, 
  Package, 
  Phone 
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

export default function VolunteerDashboard() {
  const [summary, setSummary] = useState(null);
  const [myPickups, setMyPickups] = useState([]);
  const [availablePickups, setAvailablePickups] = useState([]);
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'available'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const { addToast } = useToast();

  const fetchVolunteerData = async () => {
    setLoading(true);
    try {
      const [sumRes, myRes, availRes] = await Promise.all([
        apiClient.get('/dashboard/summary'),
        apiClient.get('/pickups/my'),
        apiClient.get('/pickups/available'),
      ]);
      setSummary(sumRes.data.metrics);
      setMyPickups(myRes.data.pickups || []);
      setAvailablePickups(availRes.data.pickups || []);
    } catch (err) {
      console.error('Failed to load volunteer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteerData();
  }, []);

  // Volunteer claims an open pickup mission
  const handleClaimMission = async (pickupId) => {
    setActionLoading(pickupId);
    try {
      await apiClient.post(`/pickups/${pickupId}/assign`, {});
      addToast('Mission accepted! You are now assigned to collect this food.', 'success');
      await fetchVolunteerData();
      setActiveTab('assigned');
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to claim mission.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Volunteer confirms collection from donor
  const handleMarkCollected = async (pickupId) => {
    setActionLoading(pickupId);
    try {
      await apiClient.patch(`/pickups/${pickupId}/collected`);
      addToast('Collection confirmed! Status updated to In Transit.', 'success');
      await fetchVolunteerData();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to confirm collection.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Volunteer confirms delivery to NGO
  const handleMarkDelivered = async (pickupId) => {
    setActionLoading(pickupId);
    try {
      await apiClient.patch(`/pickups/${pickupId}/delivered`);
      addToast('Delivery confirmed! The food redistribution lifecycle is complete.', 'success');
      await fetchVolunteerData();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to confirm delivery.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout
      title="Volunteer Courier Dashboard"
      subtitle="Accept surplus food rescue missions, collect items from donors, and confirm deliveries."
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="My Active Missions"
            value={summary?.assignedTasks ?? 0}
            subtext="In progress or to collect"
            icon={Truck}
            variant="primary"
          />
          <StatCard
            title="Completed Deliveries"
            value={summary?.completedDeliveries ?? 0}
            subtext="Delivered to recipients"
            icon={CheckCircle2}
            variant="lime"
          />
          <StatCard
            title="Available Missions"
            value={availablePickups.length}
            subtext="Ready for volunteer pickup"
            icon={ClipboardCheck}
            variant="amber"
          />
        </div>

        {/* Tab Controls */}
        <div className="bg-white rounded-2xl border border-appBorder shadow-subtle overflow-hidden">
          <div className="flex border-b border-appBorder bg-slate-50/50">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'assigned'
                  ? 'border-forest text-forest bg-white'
                  : 'border-transparent text-secText hover:text-mainText'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>My Assigned Missions ({myPickups.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('available')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'available'
                  ? 'border-forest text-forest bg-white'
                  : 'border-transparent text-secText hover:text-mainText'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Available Missions to Claim</span>
              {availablePickups.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-soft-lime text-forest font-bold">
                  {availablePickups.length}
                </span>
              )}
            </button>
          </div>

          <div className="p-6">
            {/* Tab 1: My Pickups */}
            {activeTab === 'assigned' && (
              myPickups.length === 0 ? (
                <EmptyState
                  title="No assigned delivery missions"
                  description="Check the Available Missions tab to accept and coordinate new food rescue pickups in your area."
                  actionLabel="Browse Available Missions"
                  onAction={() => setActiveTab('available')}
                />
              ) : (
                <div className="space-y-4">
                  {myPickups.map((p) => {
                    const isDelivered = p.status === 'delivered';
                    const isPickedUp = p.status === 'picked_up';
                    const isAssigned = p.status === 'assigned';

                    return (
                      <div
                        key={p._id}
                        className="p-5 rounded-2xl border border-appBorder bg-white hover:border-slate-300 transition-all shadow-subtle space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-appBorder pb-3">
                          <div>
                            <h3 className="font-bold text-forest text-base">
                              {p.donationId?.title || 'Food Rescue Item'}
                            </h3>
                            <div className="text-xs text-secText mt-0.5">
                              Quantity: <strong className="text-mainText">{p.requestId?.requestedQuantity} {p.donationId?.unit}</strong> ({p.donationId?.foodCategory})
                            </div>
                          </div>
                          <StatusBadge status={p.status} />
                        </div>

                        {/* Route Stepper: Pickup -> Delivery */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {/* Point A: Donor Pickup */}
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-appBorder space-y-1.5">
                            <div className="font-bold text-forest flex items-center space-x-1.5 uppercase tracking-wider text-[11px]">
                              <span className="w-4 h-4 rounded-full bg-forest text-white flex items-center justify-center text-[10px]">A</span>
                              <span>Pickup Location (Donor)</span>
                            </div>
                            <div className="font-semibold text-mainText">
                              {p.donationId?.donorId?.organizationName || p.donationId?.donorId?.name}
                            </div>
                            <div className="text-secText flex items-start space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                              <span>{p.donationId?.pickupAddress}</span>
                            </div>
                            {p.donationId?.donorId?.phone && (
                              <div className="text-secText flex items-center space-x-1 pt-0.5">
                                <Phone className="w-3 h-3 text-forest" />
                                <span>{p.donationId.donorId.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Point B: NGO Delivery */}
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-appBorder space-y-1.5">
                            <div className="font-bold text-forest flex items-center space-x-1.5 uppercase tracking-wider text-[11px]">
                              <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">B</span>
                              <span>Delivery Destination (NGO)</span>
                            </div>
                            <div className="font-semibold text-mainText">
                              {p.requestId?.ngoId?.organizationName || p.requestId?.ngoId?.name}
                            </div>
                            <div className="text-secText flex items-start space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                              <span>{p.requestId?.ngoId?.address || 'NGO Distribution Center'}</span>
                            </div>
                            {p.requestId?.ngoId?.phone && (
                              <div className="text-secText flex items-center space-x-1 pt-0.5">
                                <Phone className="w-3 h-3 text-primary" />
                                <span>{p.requestId.ngoId.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Handover Action Buttons */}
                        <div className="pt-2 border-t border-appBorder flex items-center justify-between">
                          <div className="text-xs text-secText">
                            {p.pickedUpAt && <span>Collected at: {new Date(p.pickedUpAt).toLocaleTimeString()} · </span>}
                            {p.deliveredAt && <span>Delivered at: {new Date(p.deliveredAt).toLocaleTimeString()}</span>}
                          </div>

                          <div className="flex items-center space-x-3">
                            {isAssigned && (
                              <Button
                                variant="primary"
                                size="sm"
                                loading={actionLoading === p._id}
                                onClick={() => handleMarkCollected(p._id)}
                              >
                                Confirm Food Collected
                              </Button>
                            )}

                            {isPickedUp && (
                              <Button
                                variant="softLime"
                                size="sm"
                                loading={actionLoading === p._id}
                                onClick={() => handleMarkDelivered(p._id)}
                              >
                                Confirm Final Delivery to NGO
                              </Button>
                            )}

                            {isDelivered && (
                              <span className="text-xs font-bold text-status-success flex items-center space-x-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Mission Complete</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Tab 2: Available Unassigned Missions */}
            {activeTab === 'available' && (
              availablePickups.length === 0 ? (
                <EmptyState
                  title="No unassigned pickup missions right now"
                  description="All approved food donations currently have volunteers assigned. Check back soon for new rescue opportunities."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availablePickups.map((ap) => (
                    <div
                      key={ap._id}
                      className="p-5 rounded-2xl border border-appBorder bg-slate-50/50 hover:bg-white transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-forest text-base">{ap.donationId?.title}</h4>
                          <span className="text-xs font-semibold text-secText">
                            Category: {ap.donationId?.foodCategory}
                          </span>
                        </div>
                        <StatusBadge status="unassigned" />
                      </div>

                      <div className="text-xs text-secText space-y-1">
                        <div>Quantity: <strong>{ap.donationId?.quantity} {ap.donationId?.unit}</strong></div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-forest" />
                          <span>Pickup: {ap.donationId?.pickupAddress}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                          <span>Recipient: {ap.requestId?.ngoId?.organizationName || 'Verified NGO'}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-appBorder">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          loading={actionLoading === ap._id}
                          onClick={() => handleClaimMission(ap._id)}
                        >
                          Accept & Claim Pickup Mission
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
