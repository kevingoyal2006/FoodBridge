import React from 'react';
import { User, Building2, Phone, MapPin, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <DashboardLayout title="Account Settings & Profile" subtitle="Manage your organization profile and account credentials.">
      <div className="max-w-2xl bg-white rounded-3xl border border-appBorder p-8 shadow-card space-y-6">
        <div className="flex items-center space-x-4 border-b border-appBorder pb-6">
          <div className="w-16 h-16 rounded-2xl bg-forest text-soft-lime flex items-center justify-center font-extrabold text-2xl shadow-sm">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-forest">{user.name}</h2>
              <StatusBadge status={user.verificationStatus} />
            </div>
            <div className="text-xs text-secText font-medium mt-0.5">{user.email}</div>
            <div className="text-xs font-semibold text-primary capitalize mt-1">Role: {user.role}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-appBorder space-y-1">
            <span className="font-semibold text-secText uppercase">Organization Name</span>
            <div className="text-sm font-bold text-mainText">{user.organizationName || 'N/A'}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-appBorder space-y-1">
            <span className="font-semibold text-secText uppercase">Registration / ID</span>
            <div className="text-sm font-bold text-mainText">{user.registrationNumber || 'N/A'}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-appBorder space-y-1">
            <span className="font-semibold text-secText uppercase">Contact Phone</span>
            <div className="text-sm font-bold text-mainText">{user.phone || 'N/A'}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-appBorder space-y-1">
            <span className="font-semibold text-secText uppercase">Account Status</span>
            <div><StatusBadge status={user.accountStatus} /></div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-appBorder space-y-1 text-xs">
          <span className="font-semibold text-secText uppercase">Official Address</span>
          <div className="text-sm font-medium text-mainText">{user.address || 'No address provided'}</div>
        </div>

        <div className="pt-4 border-t border-appBorder flex items-center justify-between">
          <span className="text-xs text-secText">FoodBridge Academic Major Project</span>
          <Button variant="destructive" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 mr-1.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
