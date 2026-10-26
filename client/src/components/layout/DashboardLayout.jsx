import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, title, subtitle, actions }) {
  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {(title || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-appBorder">
              <div>
                {title && <h1 className="text-2xl font-bold text-forest">{title}</h1>}
                {subtitle && <p className="text-sm text-secText mt-1">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center space-x-3 shrink-0">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
