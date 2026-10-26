import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartHandshake, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Bell, 
  ShieldCheck, 
  ChevronDown,
  LayoutDashboard,
  Search,
  PlusCircle,
  Truck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'donor': return '/donor/dashboard';
      case 'ngo': return '/ngo/dashboard';
      case 'volunteer': return '/volunteer/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  const roleLabels = {
    donor: 'Food Donor',
    ngo: 'NGO Recipient',
    volunteer: 'Volunteer Courier',
    admin: 'Platform Admin',
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-forest text-white sticky top-0 z-40 shadow-subtle border-b border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-soft-lime text-forest flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-white flex items-center space-x-1.5">
              <span>FoodBridge</span>
            </div>
            <div className="hidden lg:block text-[10px] text-emerald-200/80 uppercase tracking-wider font-semibold">
              Rescue Food · Reduce Waste · Feed Communities
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/donations"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              isActive('/donations') ? 'bg-forest-800 text-soft-lime' : 'text-slate-200 hover:text-white hover:bg-forest-800/60'
            }`}
          >
            Browse Surplus Food
          </Link>

          {isAuthenticated && (
            <Link
              to={getDashboardPath()}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname.includes('/dashboard') ? 'bg-forest-800 text-soft-lime' : 'text-slate-200 hover:text-white hover:bg-forest-800/60'
              }`}
            >
              Dashboard
            </Link>
          )}

          {user?.role === 'donor' && (
            <Link
              to="/donor/create"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-forest-800/60 flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4 text-soft-lime" />
              <span>Donate Food</span>
            </Link>
          )}
        </nav>

        {/* Right Action Menu */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              {/* Role badge */}
              <span className="hidden sm:inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-800 text-soft-lime border border-forest-700">
                <span className="w-1.5 h-1.5 rounded-full bg-soft-lime mr-1.5"></span>
                {roleLabels[user.role] || user.role}
              </span>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-white hover:bg-forest-800 px-3 py-1.5 rounded-xl transition-colors border border-forest-700"
                >
                  <div className="w-7 h-7 rounded-lg bg-soft-lime text-forest flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-emerald-200" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-modal border border-appBorder py-2 z-50 text-mainText animate-slide-in">
                    <div className="px-4 py-2 border-b border-appBorder">
                      <div className="text-sm font-bold text-forest truncate">{user.name}</div>
                      <div className="text-xs text-secText truncate">{user.email}</div>
                      {user.role === 'ngo' && (
                        <div className="text-[10px] font-semibold mt-1 px-2 py-0.5 rounded inline-block bg-slate-100 text-slate-700">
                          Status: {user.verificationStatus}
                        </div>
                      )}
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-forest" />
                      <span>My Dashboard</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-forest" />
                      <span>Account Settings</span>
                    </Link>

                    <div className="border-t border-appBorder my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-status-rejected hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-forest-800">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="softLime" size="sm">
                  Register Account
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-emerald-100 hover:bg-forest-800 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-forest-900 border-t border-forest-800 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/donations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-white hover:bg-forest-800"
          >
            Browse Surplus Food
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-white hover:bg-forest-800"
              >
                Dashboard ({roleLabels[user.role]})
              </Link>
              {user.role === 'donor' && (
                <Link
                  to="/donor/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-medium text-white hover:bg-forest-800"
                >
                  + Donate Food
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-white hover:bg-forest-800"
              >
                Account Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-red-300 hover:bg-forest-800"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" size="md" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="softLime" size="md" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
