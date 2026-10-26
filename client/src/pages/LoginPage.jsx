import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartHandshake, LogIn, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import Button from '../components/common/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      addToast(`Welcome back, ${data.user.name}!`, 'success');

      // Navigate to role-specific dashboard if not redirecting from a protected page
      if (from === '/') {
        switch (data.user.role) {
          case 'donor': navigate('/donor/dashboard'); break;
          case 'ngo': navigate('/ngo/dashboard'); break;
          case 'volunteer': navigate('/volunteer/dashboard'); break;
          case 'admin': navigate('/admin/dashboard'); break;
          default: navigate('/');
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-appBorder shadow-card">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-forest text-soft-lime flex items-center justify-center font-bold shadow-sm">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-forest tracking-tight">
            Sign In to FoodBridge
          </h2>
          <p className="text-xs text-secText">
            Enter your credentials to access your organization dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-status-rejected text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@organization.com"
          />

          <Input
            label="Password"
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full mt-2"
          >
            <span>Sign In</span>
            <LogIn className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Quick Demo Credentials Autofill */}
        <div className="pt-4 border-t border-appBorder space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-secText text-center">
            Quick Fill Demo Credentials
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoCredentials('donor@freshbites.com', 'Donor@123')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-forest hover:text-white border border-appBorder text-forest font-medium transition-colors text-left"
            >
              🥗 Donor (FreshBites)
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('ngo@carefeed.org', 'Ngo@123')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-forest hover:text-white border border-appBorder text-forest font-medium transition-colors text-left"
            >
              🏢 Verified NGO
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('volunteer@swiftrescue.org', 'Volunteer@123')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-forest hover:text-white border border-appBorder text-forest font-medium transition-colors text-left"
            >
              🚚 Volunteer Courier
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@foodbridge.org', 'Admin@123')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-forest hover:text-white border border-appBorder text-forest font-medium transition-colors text-left"
            >
              👑 Platform Admin
            </button>
          </div>
        </div>

        {/* Register footer link */}
        <div className="text-center text-xs text-secText pt-2">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
