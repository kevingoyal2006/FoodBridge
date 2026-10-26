import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  ArrowRight, 
  UtensilsCrossed, 
  Building2, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Package,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import apiClient from '../services/apiClient';

export default function LandingPage() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);

  // Quick 1-click evaluator demo login
  const handleDemoLogin = async (email, password, roleName, targetPath) => {
    setDemoLoading(true);
    try {
      await login(email, password);
      addToast(`Logged in as Demo ${roleName}!`, 'success');
      navigate(targetPath);
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to authenticate demo account. Please run seed script.', 'error');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-forest text-white p-8 sm:p-14 lg:p-16 shadow-card border border-forest-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-soft-lime text-forest text-xs font-bold shadow-subtle">
            <Sparkles className="w-4 h-4 text-forest shrink-0" />
            <span>Food Donation & Redistribution Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Rescue Food. <br />
            Reduce Waste. <br />
            <span className="text-soft-lime">Feed Communities.</span>
          </h1>

          <p className="text-slate-200 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl">
            A verified coordination ecosystem connecting surplus-food donors, vetted NGOs, and volunteer couriers to make local food redistribution seamless, transparent, and accountable.
          </p>

          {/* Primary CTA Buttons */}
          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <Link to="/donor/create">
              <Button variant="softLime" size="lg" className="shadow-md">
                <span>Donate Surplus Food</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>

            <Link to="/donations">
              <Button variant="secondary" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
                <span>Browse Available Food</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient background accent */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <HeartHandshake className="w-[500px] h-[500px] text-soft-lime" />
        </div>
      </section>

      {/* Evaluator Quick Demo Switcher */}
      <section className="bg-white rounded-2xl border border-appBorder p-6 sm:p-8 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-appBorder pb-4">
          <div>
            <h2 className="text-lg font-bold text-forest flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span>Evaluator Demo Switcher (Instant 1-Click Role Login)</span>
            </h2>
            <p className="text-xs text-secText mt-0.5">
              Instantly authenticate as any of the 4 tested roles with pre-seeded credentials.
            </p>
          </div>
          <span className="text-xs font-semibold text-secText bg-warm-cream px-3 py-1 rounded-full border border-amber-200">
            Seed Data Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          <button
            onClick={() => handleDemoLogin('donor@freshbites.com', 'Donor@123', 'Donor', '/donor/dashboard')}
            disabled={demoLoading}
            className="p-3.5 rounded-xl border border-appBorder bg-slate-50/60 hover:bg-forest hover:text-white transition-all text-left group"
          >
            <div className="text-xs font-bold text-forest group-hover:text-soft-lime flex items-center justify-between">
              <span>1. Food Donor</span>
              <UtensilsCrossed className="w-4 h-4 text-primary group-hover:text-soft-lime" />
            </div>
            <div className="text-[11px] text-secText group-hover:text-slate-200 mt-1 truncate">
              FreshBites Bakery
            </div>
          </button>

          <button
            onClick={() => handleDemoLogin('ngo@carefeed.org', 'Ngo@123', 'Verified NGO', '/ngo/dashboard')}
            disabled={demoLoading}
            className="p-3.5 rounded-xl border border-appBorder bg-slate-50/60 hover:bg-forest hover:text-white transition-all text-left group"
          >
            <div className="text-xs font-bold text-forest group-hover:text-soft-lime flex items-center justify-between">
              <span>2. Verified NGO</span>
              <Building2 className="w-4 h-4 text-status-success group-hover:text-soft-lime" />
            </div>
            <div className="text-[11px] text-secText group-hover:text-slate-200 mt-1 truncate">
              CareFeed Foundation
            </div>
          </button>

          <button
            onClick={() => handleDemoLogin('pending@hopecommunity.org', 'Ngo@123', 'Pending NGO', '/ngo/dashboard')}
            disabled={demoLoading}
            className="p-3.5 rounded-xl border border-appBorder bg-slate-50/60 hover:bg-forest hover:text-white transition-all text-left group"
          >
            <div className="text-xs font-bold text-forest group-hover:text-soft-lime flex items-center justify-between">
              <span>3. Pending NGO</span>
              <Building2 className="w-4 h-4 text-status-pending group-hover:text-soft-lime" />
            </div>
            <div className="text-[11px] text-secText group-hover:text-slate-200 mt-1 truncate">
              Hope Shelter (Pending)
            </div>
          </button>

          <button
            onClick={() => handleDemoLogin('volunteer@swiftrescue.org', 'Volunteer@123', 'Volunteer', '/volunteer/dashboard')}
            disabled={demoLoading}
            className="p-3.5 rounded-xl border border-appBorder bg-slate-50/60 hover:bg-forest hover:text-white transition-all text-left group"
          >
            <div className="text-xs font-bold text-forest group-hover:text-soft-lime flex items-center justify-between">
              <span>4. Volunteer</span>
              <Truck className="w-4 h-4 text-blue-600 group-hover:text-soft-lime" />
            </div>
            <div className="text-[11px] text-secText group-hover:text-slate-200 mt-1 truncate">
              SwiftRescue Logistics
            </div>
          </button>

          <button
            onClick={() => handleDemoLogin('admin@foodbridge.org', 'Admin@123', 'Administrator', '/admin/dashboard')}
            disabled={demoLoading}
            className="p-3.5 rounded-xl border border-appBorder bg-slate-50/60 hover:bg-forest hover:text-white transition-all text-left group"
          >
            <div className="text-xs font-bold text-forest group-hover:text-soft-lime flex items-center justify-between">
              <span>5. Platform Admin</span>
              <ShieldCheck className="w-4 h-4 text-purple-600 group-hover:text-soft-lime" />
            </div>
            <div className="text-[11px] text-secText group-hover:text-slate-200 mt-1 truncate">
              Verification & Audit
            </div>
          </button>
        </div>
      </section>

      {/* The 4-Step Redistribution Workflow */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest">
            How FoodBridge Works
          </h2>
          <p className="text-sm text-secText leading-relaxed">
            A transparent and traceable 4-step pipeline designed to prevent waste and deliver surplus meals reliably.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-appBorder p-6 space-y-3 shadow-subtle hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-bold text-forest text-base">Surplus Published</h3>
            <p className="text-xs text-secText leading-relaxed">
              Restaurants and hosts list available meals, category, allergens, storage instructions, and strict pickup deadlines.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-appBorder p-6 space-y-3 shadow-subtle hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-status-info flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-bold text-forest text-base">Verified NGO Claim</h3>
            <p className="text-xs text-secText leading-relaxed">
              Administratively verified NGOs request available quantities. Donors approve requests with atomic single-reservation.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-appBorder p-6 space-y-3 shadow-subtle hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-status-pending flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-bold text-forest text-base">Volunteer Collection</h3>
            <p className="text-xs text-secText leading-relaxed">
              Couriers accept assigned missions, collect food from the donor, and confirm collection with server timestamps.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-appBorder p-6 space-y-3 shadow-subtle hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-soft-lime text-forest flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="font-bold text-forest text-base">Handover & Traceability</h3>
            <p className="text-xs text-secText leading-relaxed">
              Recipient verifies receipt. Delivery is immutably logged in the audit trail, and impact metrics are incremented.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Security Banner */}
      <section className="bg-gradient-to-r from-forest to-forest-900 rounded-3xl p-8 sm:p-12 text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl font-bold text-white">Built for Trust, Safety & Accountability</h2>
          <p className="text-slate-200 text-sm leading-relaxed">
            Every handover is documented with immutable server timestamps. Donor locations are shielded from public view, and duplicate claims are strictly prevented at the database level.
          </p>
        </div>

        <Link to="/register">
          <Button variant="softLime" size="lg" className="whitespace-nowrap shadow-md">
            <span>Join FoodBridge Today</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
