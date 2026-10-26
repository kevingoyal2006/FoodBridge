import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListOrdered, 
  Inbox, 
  Search, 
  FileCheck2, 
  Truck, 
  Users, 
  ClipboardCheck, 
  ShieldAlert,
  History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const linksByRole = {
    donor: [
      { to: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/donor/create', label: 'Donate Food', icon: PlusCircle },
      { to: '/donor/donations', label: 'My Listings', icon: ListOrdered },
      { to: '/donor/requests', label: 'Received Requests', icon: Inbox },
    ],
    ngo: [
      { to: '/ngo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/donations', label: 'Browse Food', icon: Search },
      { to: '/ngo/requests', label: 'My Food Claims', icon: FileCheck2 },
    ],
    volunteer: [
      { to: '/volunteer/dashboard', label: 'Missions Dashboard', icon: LayoutDashboard },
      { to: '/volunteer/pickups', label: 'My Deliveries', icon: Truck },
      { to: '/volunteer/available', label: 'Available Missions', icon: ClipboardCheck },
    ],
    admin: [
      { to: '/admin/dashboard', label: 'System Overview', icon: LayoutDashboard },
      { to: '/admin/verifications', label: 'NGO Verifications', icon: ShieldAlert },
      { to: '/admin/users', label: 'User Directory', icon: Users },
      { to: '/admin/audit', label: 'Audit Log Trail', icon: History },
    ],
  };

  const navLinks = linksByRole[user.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-appBorder min-h-[calc(100vh-4rem)] hidden md:block shrink-0 p-4 space-y-6">
      <div className="space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-secText px-3 mb-2">
          {user.role} Navigation
        </div>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-forest text-soft-lime shadow-subtle'
                    : 'text-secText hover:text-mainText hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {user.role === 'ngo' && user.verificationStatus !== 'verified' && (
        <div className="p-3.5 rounded-xl bg-status-pending-bg border border-status-pending-border text-xs text-status-pending space-y-1.5">
          <div className="font-bold flex items-center space-x-1">
            <span>⚠️ Verification Pending</span>
          </div>
          <p className="leading-relaxed">
            Your NGO registration is under administrative review. Once approved, you can claim donations.
          </p>
        </div>
      )}
    </aside>
  );
}
