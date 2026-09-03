import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, Smartphone, Wallet } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import DemoBanner from '../common/DemoBanner';
import ToastContainer from '../common/Toast';

export default function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7f8] flex flex-col">
      <DemoBanner />
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 grid grid-cols-5 text-[10px] font-semibold">
        {[
          { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
          { to: '/clients', icon: Users, label: 'Clients' },
          { to: '/risk-alerts', icon: AlertTriangle, label: 'Risk' },
          { to: '/demo/sms', icon: Smartphone, label: 'SMS' },
          { to: '/demo/payment', icon: Wallet, label: 'Pay' },
        ].map((i) => {
          const Icon = i.icon;
          return (
            <NavLink
              key={i.to}
              to={i.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 ${isActive ? 'text-teal-700' : 'text-slate-400'}`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {i.label}
            </NavLink>
          );
        })}
      </nav>
      <ToastContainer />
    </div>
  );
}
