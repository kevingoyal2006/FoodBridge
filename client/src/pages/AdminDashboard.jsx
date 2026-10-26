import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Package, 
  CheckCircle2, 
  ShieldAlert, 
  History, 
  Check, 
  X, 
  Search,
  UserCheck,
  UserX
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications' | 'users' | 'audit'
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchUser, setSearchUser] = useState('');

  const { addToast } = useToast();

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [sumRes, userRes, auditRes] = await Promise.all([
        apiClient.get('/dashboard/summary'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/audit-logs'),
      ]);
      setSummary(sumRes.data.metrics);
      setUsers(userRes.data.users || []);
      setAuditLogs(auditRes.data.logs || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Admin approves or rejects NGO verification
  const handleVerifyNgo = async (userId, verificationStatus) => {
    setActionLoading(userId);
    try {
      await apiClient.patch(`/admin/users/${userId}/verification`, {
        verificationStatus,
        notes: verificationStatus === 'verified'
          ? 'Approved after document verification.'
          : 'Registration details did not meet criteria.',
      });
      addToast(`NGO organization marked as ${verificationStatus}!`, 'success');
      await fetchAdminData();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Verification update failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Admin toggles user account status (active / suspended)
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setActionLoading(userId);
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, {
        accountStatus: newStatus,
      });
      addToast(`Account status updated to ${newStatus}.`, 'info');
      await fetchAdminData();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Status update failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingNgos = users.filter((u) => u.role === 'ngo' && u.verificationStatus === 'pending');

  const filteredUsers = users.filter((u) => {
    if (!searchUser.trim()) return true;
    const q = searchUser.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.organizationName?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout
      title="Platform Administration"
      subtitle="Verify recipient NGOs, audit platform security logs, and manage user accounts."
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Registered Users"
            value={summary?.totalUsers ?? 0}
            subtext="Across all 4 roles"
            icon={Users}
            variant="default"
          />
          <StatCard
            title="Pending NGO Verifications"
            value={summary?.pendingNgos ?? 0}
            subtext="Requires admin review"
            icon={ShieldAlert}
            variant="amber"
          />
          <StatCard
            title="Total Surplus Listings"
            value={summary?.totalDonations ?? 0}
            subtext="Published by donors"
            icon={Package}
            variant="primary"
          />
          <StatCard
            title="Completed Deliveries"
            value={summary?.completedDeliveries ?? 0}
            subtext="Successfully handed over"
            icon={CheckCircle2}
            variant="lime"
          />
        </div>

        {/* Tab Controls */}
        <div className="bg-white rounded-2xl border border-appBorder shadow-subtle overflow-hidden">
          <div className="flex border-b border-appBorder bg-slate-50/50">
            <button
              onClick={() => setActiveTab('verifications')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'verifications'
                  ? 'border-forest text-forest bg-white'
                  : 'border-transparent text-secText hover:text-mainText'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>NGO Verification Queue</span>
              {pendingNgos.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-status-pending-bg text-status-pending border border-status-pending-border font-bold">
                  {pendingNgos.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'users'
                  ? 'border-forest text-forest bg-white'
                  : 'border-transparent text-secText hover:text-mainText'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Directory ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'audit'
                  ? 'border-forest text-forest bg-white'
                  : 'border-transparent text-secText hover:text-mainText'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Log Trail ({auditLogs.length})</span>
            </button>
          </div>

          <div className="p-6">
            {/* Tab 1: NGO Verification Queue */}
            {activeTab === 'verifications' && (
              pendingNgos.length === 0 ? (
                <EmptyState
                  title="No NGOs waiting for verification"
                  description="All registered recipient organizations have been verified. New registrations will appear here automatically."
                  icon={ShieldCheck}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-appBorder text-xs uppercase tracking-wider text-secText bg-slate-50/60">
                        <th className="py-3 px-4">Organization Name</th>
                        <th className="py-3 px-4">Registration ID</th>
                        <th className="py-3 px-4">Contact Person</th>
                        <th className="py-3 px-4">Phone & Address</th>
                        <th className="py-3 px-4 text-right">Verification Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-appBorder">
                      {pendingNgos.map((ngo) => (
                        <tr key={ngo._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4 font-bold text-forest">
                            {ngo.organizationName || ngo.name}
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-mainText font-semibold">
                            {ngo.registrationNumber || 'Not submitted'}
                          </td>
                          <td className="py-4 px-4 text-xs">
                            <div className="font-semibold text-mainText">{ngo.name}</div>
                            <div className="text-secText">{ngo.email}</div>
                          </td>
                          <td className="py-4 px-4 text-xs text-secText">
                            <div>{ngo.phone || 'No phone'}</div>
                            <div className="truncate max-w-xs">{ngo.address || 'No address'}</div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex space-x-2">
                              <Button
                                variant="primary"
                                size="sm"
                                loading={actionLoading === ngo._id}
                                onClick={() => handleVerifyNgo(ngo._id, 'verified')}
                              >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                <span>Verify NGO</span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                loading={actionLoading === ngo._id}
                                onClick={() => handleVerifyNgo(ngo._id, 'rejected')}
                              >
                                <X className="w-3.5 h-3.5 mr-1" />
                                <span>Reject</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Tab 2: User Directory */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative max-w-sm w-full">
                    <Search className="w-4 h-4 text-secText absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      placeholder="Search users by name, email, or role..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-appBorder text-xs uppercase tracking-wider text-secText bg-slate-50/60">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Verification</th>
                        <th className="py-3 px-4">Account Status</th>
                        <th className="py-3 px-4 text-right">Moderation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-appBorder">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-mainText">{u.name}</div>
                            <div className="text-xs text-secText">{u.email}</div>
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold capitalize text-forest">
                            {u.role}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={u.verificationStatus} />
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={u.accountStatus} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleStatus(u._id, u.accountStatus)}
                                className={`text-xs font-semibold hover:underline ${
                                  u.accountStatus === 'active'
                                    ? 'text-status-rejected'
                                    : 'text-status-success'
                                }`}
                              >
                                {u.accountStatus === 'active' ? 'Suspend Account' : 'Reactivate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: System Audit Log */}
            {activeTab === 'audit' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-appBorder text-xs uppercase tracking-wider text-secText bg-slate-50/60">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Entity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-appBorder">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/50 transition-colors font-mono text-xs">
                        <td className="py-3 px-4 text-secText">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-forest">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-mainText">
                          {log.actorId?.name || log.actorId?.email || 'System'}
                        </td>
                        <td className="py-3 px-4 text-secText uppercase">
                          {log.entityType}
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
