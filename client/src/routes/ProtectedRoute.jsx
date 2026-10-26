import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm font-semibold text-secText">Verifying FoodBridge session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-appBorder text-center space-y-4 shadow-card">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 text-status-rejected flex items-center justify-center font-bold text-xl">
            403
          </div>
          <h2 className="text-xl font-bold text-forest">Access Restricted</h2>
          <p className="text-sm text-secText leading-relaxed">
            Your account role (<strong className="capitalize text-mainText">{user.role}</strong>) does not have permission to view this section.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 rounded-xl bg-forest text-white text-sm font-semibold hover:bg-forest-950 transition-colors"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return children;
}
