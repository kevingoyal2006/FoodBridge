import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DonationDiscoveryPage from '../pages/DonationDiscoveryPage';
import DonorDashboard from '../pages/DonorDashboard';
import CreateDonationPage from '../pages/CreateDonationPage';
import NgoDashboard from '../pages/NgoDashboard';
import VolunteerDashboard from '../pages/VolunteerDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import ProfilePage from '../pages/ProfilePage';
import Navbar from '../components/layout/Navbar';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
              <LandingPage />
            </main>
          </div>
        }
      />
      <Route
        path="/login"
        element={
          <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
            <Navbar />
            <LoginPage />
          </div>
        }
      />
      <Route
        path="/register"
        element={
          <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
            <Navbar />
            <RegisterPage />
          </div>
        }
      />
      <Route path="/donations" element={<DonationDiscoveryPage />} />

      {/* Profile & Shared Authenticated */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Donor Routes */}
      <Route
        path="/donor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['donor', 'admin']}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/create"
        element={
          <ProtectedRoute allowedRoles={['donor']}>
            <CreateDonationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/donations"
        element={
          <ProtectedRoute allowedRoles={['donor', 'admin']}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/requests"
        element={
          <ProtectedRoute allowedRoles={['donor', 'admin']}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />

      {/* NGO Routes */}
      <Route
        path="/ngo/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ngo', 'admin']}>
            <NgoDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ngo/requests"
        element={
          <ProtectedRoute allowedRoles={['ngo', 'admin']}>
            <NgoDashboard />
          </ProtectedRoute>
        }
      />

      {/* Volunteer Routes */}
      <Route
        path="/volunteer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/pickups"
        element={
          <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/available"
        element={
          <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/verifications"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
