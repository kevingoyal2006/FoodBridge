import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Server, 
  Database, 
  Activity, 
  ShieldCheck, 
  Users, 
  Truck, 
  Building2, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { checkHealth } from './services/apiClient';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to reach API server');
      if (err.response?.data) {
        setHealth(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">FoodBridge</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Milestone T1: Foundation
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a 
              href="https://github.com/kevingoyal2006/FoodBridge" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              GitHub Repository
              <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-400" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 rounded-2xl p-8 sm:p-10 text-white shadow-xl shadow-slate-950/10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-medium border border-brand-500/30">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
              <span>Pure MERN Stack Platform Initialized</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Food Donation & Redistribution Platform
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Bridging surplus-food donors, verified recipient NGOs, volunteer delivery networks, and platform administrators through a secure, traceable coordination system.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
            <HeartHandshake className="w-96 h-96 text-brand-400" />
          </div>
        </div>

        {/* System Health Inspector */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900">Backend & Database Health Inspector</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Real-time validation of Express API runtime and MongoDB database connectivity.
              </p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-600' : ''}`} />
              <span>{loading ? 'Checking Status...' : 'Refresh Health'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* API Status Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Express REST API</span>
                <Server className="w-5 h-5 text-slate-400" />
              </div>
              <div className="mt-4 flex items-center space-x-2.5">
                {health?.status === 'healthy' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                )}
                <div>
                  <div className="text-lg font-bold text-slate-900 capitalize">
                    {health?.service || 'FoodBridge API'}
                  </div>
                  <div className="text-xs text-slate-500">
                    Endpoint: <code className="bg-slate-200/60 px-1.5 py-0.5 rounded font-mono text-slate-700">/api/v1/health</code>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                <span>Status:</span>
                <span className={`font-semibold px-2 py-0.5 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {health?.status || (error ? 'Degraded / Offline' : 'Checking')}
                </span>
              </div>
            </div>

            {/* MongoDB Status Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">MongoDB Database</span>
                <Database className="w-5 h-5 text-slate-400" />
              </div>
              <div className="mt-4 flex items-center space-x-2.5">
                {health?.database?.connected ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                )}
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    {health?.database?.connected ? 'Connected' : 'Connection Standby'}
                  </div>
                  <div className="text-xs text-slate-500">
                    Database: <span className="font-mono text-slate-700">{health?.database?.database || 'foodbridge'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                <span>ODM Driver:</span>
                <span className="font-semibold text-slate-700">Mongoose v8.9.x</span>
              </div>
            </div>

            {/* Runtime & Security Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Security & Environment</span>
                <ShieldCheck className="w-5 h-5 text-brand-600" />
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Environment:</span>
                  <span className="font-semibold text-slate-900">{health?.environment || 'development'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Uptime:</span>
                  <span className="font-semibold text-slate-900">{health?.uptimeSeconds !== undefined ? `${health.uptimeSeconds}s` : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Headers:</span>
                  <span className="font-semibold text-emerald-600">Helmet Active</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                <span>CORS Origin:</span>
                <span className="font-mono text-slate-700">http://localhost:5173</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Core Roles Architecture Card */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Architectural Role Definitions</h2>
              <p className="text-sm text-slate-500">The 4 validated user roles supporting the donation-to-delivery lifecycle.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-slate-900">Donor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Publishes surplus food with quantity, expiry deadlines, and pickup notes. Reviews and approves incoming NGO requests.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-slate-900">NGO (Recipient)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Registers organization credentials. Once verified by an administrator, browses and claims available food.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-slate-900">Volunteer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manages assigned collection tasks, records pickup with server timestamp, and logs handover delivery.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-bold text-slate-900">Administrator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verifies NGO authenticity, manages user accounts, inspects tamper-proof audit trails, and exports metrics.
              </p>
            </div>
          </div>
        </section>

        {/* Local Startup Commands Reference */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2 text-slate-900">
            <Terminal className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold">Local Startup Commands</h2>
          </div>
          <p className="text-sm text-slate-500">
            Run the server and client concurrently in separate terminals:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="text-slate-400 font-sans font-semibold text-xs border-b border-slate-800 pb-1.5 flex items-center justify-between">
                <span>Terminal 1: Express API Server</span>
                <span className="text-brand-400">Port 5000</span>
              </div>
              <p className="text-slate-400"># Navigate to server directory and start dev server</p>
              <p className="text-emerald-400">cd server</p>
              <p className="text-emerald-400">npm run dev</p>
            </div>

            <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="text-slate-400 font-sans font-semibold text-xs border-b border-slate-800 pb-1.5 flex items-center justify-between">
                <span>Terminal 2: Vite React Frontend</span>
                <span className="text-brand-400">Port 5173</span>
              </div>
              <p className="text-slate-400"># Navigate to client directory and start dev server</p>
              <p className="text-emerald-400">cd client</p>
              <p className="text-emerald-400">npm run dev</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>FoodBridge — College Major Project · MERN Stack</p>
      </footer>
    </div>
  );
}
