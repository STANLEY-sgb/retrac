import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard, Users, MessageSquare, AlertTriangle, HeartHandshake,
  Briefcase, GitCompare, Building2, Wallet, BarChart3, Settings,
  ShieldCheck, History, Smartphone, CreditCard, PlusCircle, X,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

const NavItem = ({ item, onClose }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClose}
      end={item.to === "/dashboard"}
      className={({ isActive }) =>
        `group flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
          isActive
            ? "bg-[#082f49] text-white shadow-sm"
            : item.highlight
            ? "text-teal-700 hover:bg-teal-50 hover:text-teal-900"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      <span className="flex items-center gap-2.5">
        <Icon className="w-[15px] h-[15px] shrink-0" />
        {item.label}
      </span>
      {item.badge ? (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
          {item.badge}
        </span>
      ) : null}
    </NavLink>
  );
};

export default function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const { role, user } = useAuth();
  const { unreadCount } = useNotifications();

  const employerGroups = [
    {
      title: "Employer Portal",
      items: [
        { to: "/dashboard",   label: "Overview",       icon: LayoutDashboard },
        { to: "/jobs",        label: "My Vacancies",   icon: Briefcase },
        { to: "/jobs/new",    label: "Post a Job",     icon: PlusCircle },
        { to: "/job-matches", label: "Candidates",     icon: GitCompare },
        { to: "/payments",    label: "Stipends & Pay", icon: Wallet },
      ],
    },
    {
      title: "Simulators",
      highlight: true,
      items: [
        { to: "/demo/payment", label: "Mobile Money Sim", icon: CreditCard, highlight: true },
      ],
    },
  ];

  const clinicalGroups = [
    {
      title: "Care",
      items: [
        { to: "/dashboard",     label: "Overview",       icon: LayoutDashboard },
        { to: "/clients",       label: "Clients",        icon: Users },
        { to: "/check-ins",     label: "Check-ins",      icon: MessageSquare },
        { to: "/risk-alerts",   label: "Risk Alerts",    icon: AlertTriangle, badge: unreadCount > 0 ? unreadCount : null },
        { to: "/interventions", label: "Interventions",  icon: HeartHandshake },
      ],
    },
    {
      title: "Employment",
      items: [
        { to: "/jobs",        label: "Job Board",   icon: Briefcase },
        { to: "/job-matches", label: "Matches",     icon: GitCompare },
        { to: "/employers",   label: "Employers",   icon: Building2 },
        { to: "/payments",    label: "Payments",    icon: Wallet },
      ],
    },
    {
      title: "Reports & System",
      items: [
        { to: "/reports",      label: "Reports",    icon: BarChart3 },
        ...(role === "admin"
          ? [
              { to: "/settings",        label: "Settings",  icon: Settings },
              { to: "/admin/users",     label: "Users",     icon: ShieldCheck },
              { to: "/admin/audit-logs", label: "Audit Log", icon: History },
            ]
          : []),
      ],
    },
    {
      title: "Demo Simulators",
      highlight: true,
      items: [
        { to: "/demo/sms",     label: "SMS Simulator",   icon: Smartphone,  highlight: true },
        { to: "/demo/payment", label: "Mobile Money Sim", icon: CreditCard,  highlight: true },
      ],
    },
  ];

  const groups = role === "employer" ? employerGroups : clinicalGroups;

  const roleLabel = role === "admin" ? "System Admin" : role === "employer" ? "Employer Partner" : "Caseworker";
  const roleBg = role === "admin" ? "bg-blue-900/30 text-blue-300 border-blue-700/30" : role === "employer" ? "bg-amber-900/30 text-amber-300 border-amber-700/30" : "bg-teal-900/30 text-teal-300 border-teal-700/30";

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-56 bg-white border-r border-slate-200/80 flex flex-col shadow-[1px_0_0_0_rgba(15,23,42,0.04)] transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo row — visible on mobile, hidden on desktop (navbar shows it) */}
        <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={onCloseMobile}>
            <img src="/logo.svg" alt="ReTrac" className="w-7 h-7" />
            <span className="text-base font-extrabold tracking-tight">
              Re<span className="text-teal-600">Trac</span>
            </span>
          </Link>
          <button onClick={onCloseMobile} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav groups */}
        <div className="flex-1 overflow-y-auto py-3 px-2.5 custom-scrollbar space-y-5">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {g.title}
              </p>
              <nav className="space-y-0.5">
                {g.items.map((item) => (
                  <NavItem key={item.to} item={item} onClose={onCloseMobile} />
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Role badge at bottom */}
        <div className="px-3 py-3 border-t border-slate-100">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${roleBg}`}>
            <div className="w-6 h-6 rounded-md bg-current/20 flex items-center justify-center text-[10px] font-extrabold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold truncate">{user?.name?.split(" ")[0] || "User"}</p>
              <p className="text-[9px] uppercase tracking-wider opacity-70">{roleLabel}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
