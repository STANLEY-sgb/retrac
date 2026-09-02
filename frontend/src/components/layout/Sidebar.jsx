import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  AlertTriangle,
  HeartHandshake,
  Briefcase,
  GitCompare,
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  ShieldCheck,
  History,
  Smartphone,
  Send,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const { role } = useAuth();

  const mainLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/clients', label: 'Clients (Patients)', icon: Users },
    { to: '/check-ins', label: 'SMS Check-Ins', icon: MessageSquare },
    { to: '/risk-alerts', label: 'Risk Alerts', icon: AlertTriangle, badge: 'Active' },
    { to: '/interventions', label: 'Interventions', icon: HeartHandshake },
  ];

  const employmentLinks = [
    { to: '/jobs', label: 'Reintegration Jobs', icon: Briefcase },
    { to: '/job-matches', label: 'Skill Matcher', icon: GitCompare },
    { to: '/employers', label: 'Employer Portal', icon: Building2 },
    { to: '/payments', label: 'Mobile Money', icon: CreditCard },
  ];

  const analyticsLinks = [
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/settings', label: 'System Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin/users', label: 'User Management', icon: ShieldCheck },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: History },
  ];

  const simulatorLinks = [
    { to: '/demo/sms', label: 'SMS Simulator', icon: Smartphone, highlight: true },
    { to: '/demo/payment', label: 'Payment Simulator', icon: Send, highlight: true },
  ];

  const renderNavGroup = (title, items) => (
    <div className="mb-5">
      <p className="px-3 text-3xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
        {title}
      </p>
      <nav className="space-y-1">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : item.highlight
                    ? 'bg-slate-100/80 text-teal-800 hover:bg-teal-50 hover:text-teal-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-3xs font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
          <span className="text-base font-bold text-slate-900">ReTrac Navigation</span>
          <button onClick={onCloseMobile} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {renderNavGroup('Clinical & Care', mainLinks)}
          {renderNavGroup('Reintegration & Jobs', employmentLinks)}
          {renderNavGroup('Insights & Config', analyticsLinks)}
          {role === 'admin' && renderNavGroup('Administration', adminLinks)}
          {renderNavGroup('Interactive Simulators', simulatorLinks)}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-2xs text-slate-400">
          <p className="font-semibold text-slate-600">ReTrac Platform v1.0.0</p>
          <p>DOMINION 2026 Hackathon</p>
        </div>
      </aside>
    </>
  );
}
