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
  Wallet,
  BarChart3,
  Settings,
  ShieldCheck,
  History,
  Smartphone,
  CreditCard,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const { role } = useAuth();
  const { unreadCount } = useNotifications();

  const groups = [
    {
      title: 'Care',
      items: [
        { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { to: '/clients', label: 'Clients', icon: Users },
        { to: '/check-ins', label: 'Check-ins', icon: MessageSquare },
        { to: '/risk-alerts', label: 'Risk', icon: AlertTriangle, badge: unreadCount > 0 ? unreadCount : null },
        { to: '/interventions', label: 'Interventions', icon: HeartHandshake },
      ]
    },
    {
      title: 'Work',
      items: [
        { to: '/jobs', label: 'Jobs', icon: Briefcase },
        { to: '/job-matches', label: 'Matches', icon: GitCompare },
        { to: '/employers', label: 'Employers', icon: Building2 },
        { to: '/payments', label: 'Payments', icon: Wallet },
      ]
    },
    {
      title: 'System',
      items: [
        { to: '/reports', label: 'Reports', icon: BarChart3 },
        ...(role === 'admin' ? [
          { to: '/settings', label: 'Settings', icon: Settings },
          { to: '/admin/users', label: 'Users', icon: ShieldCheck },
          { to: '/admin/audit-logs', label: 'Audit', icon: History },
        ] : [])
      ]
    },
    {
      title: 'Demo',
      items: [
        { to: '/demo/sms', label: 'SMS', icon: Smartphone, highlight: true },
        { to: '/demo/payment', label: 'Mobile Money', icon: CreditCard, highlight: true },
      ]
    }
  ];

  return (
    <>
      {mobileOpen && (
        <div onClick={onCloseMobile} className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" />
      )}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-56 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
          <span className="text-sm font-bold">Menu</span>
          <button onClick={onCloseMobile} className="p-1 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {groups.map((g) => (
            <div key={g.title} className="mb-5">
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{g.title}</p>
              <nav className="space-y-0.5">
                {g.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                          isActive
                            ? 'bg-[#082f49] text-white'
                            : item.highlight
                            ? 'text-teal-800 hover:bg-teal-50'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </span>
                      {item.badge ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
