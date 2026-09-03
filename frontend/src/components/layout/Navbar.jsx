import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, ChevronDown, Menu, User, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import Avatar from "../ui/Avatar";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/clients": "Clients",
  "/check-ins": "Check-ins",
  "/checkins": "Check-ins",
  "/risk-alerts": "Risk Alerts",
  "/interventions": "Interventions",
  "/jobs": "Job Board",
  "/jobs/new": "Post a Job",
  "/job-matches": "Job Matching",
  "/employers": "Employers",
  "/payments": "Payments",
  "/notifications": "Notifications",
  "/reports": "Reports",
  "/settings": "Settings",
  "/admin/users": "User Management",
  "/admin/audit-logs": "Audit Log",
  "/demo/sms": "SMS Simulator",
  "/demo/payment": "Mobile Money",
};

function getPageTitle(pathname) {
  // Check exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Check prefix
  const key = Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k) && k !== "/");
  return key ? PAGE_TITLES[key] : "ReTrac";
}

export default function Navbar({ onToggleMobileSidebar }) {
  const { user, role, logout, quickLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickRole = async (roleKey) => {
    setSwitchingRole(roleKey);
    try {
      await quickLogin(roleKey);
      navigate("/dashboard");
    } finally {
      setSwitchingRole(null);
    }
  };

  const formatNotifTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-30 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3">

        {/* Left — hamburger + logo + page title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="hidden lg:flex items-center gap-2 shrink-0">
            <img src="/logo.svg" alt="ReTrac" className="w-7 h-7" />
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              Re<span className="text-teal-600">Trac</span>
            </span>
          </Link>
          <div className="hidden lg:block w-px h-5 bg-slate-200 mx-1" />
          <span className="text-sm font-semibold text-slate-700 truncate">{pageTitle}</span>
        </div>

        {/* Center — search */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search clients, jobs…"
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-teal-400 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right — role switcher + notif + profile */}
        <div className="flex items-center gap-1.5">

          {/* Quick Role Switcher */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl text-[11px] font-semibold border border-slate-200/60">
            {[
              { id: "caseworker", label: "Caseworker" },
              { id: "admin",      label: "Admin" },
              { id: "employer",   label: "Employer" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => handleQuickRole(r.id)}
                disabled={!!switchingRole}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-60 ${
                  role === r.id
                    ? "bg-white shadow-sm text-[#082f49] border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {switchingRole === r.id ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : r.label}
              </button>
            ))}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifs(!showNotifs); setShowProfileMenu(false); }}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_8px_24px_-4px_rgba(15,23,42,0.14)] border border-slate-200 overflow-hidden z-50 animate-scale-up">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Alerts & Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-teal-700 font-semibold hover:text-teal-800">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">No notifications yet</div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => { markAsRead(n.id); setShowNotifs(false); }}
                        className={`w-full text-left px-4 py-3 text-xs hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${
                          n.is_read ? "opacity-60" : "bg-sky-50/40"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 shrink-0" />}
                          <div className={n.is_read ? "" : ""}>
                            <p className="font-bold text-slate-800">{n.title}</p>
                            <p className="text-slate-500 mt-0.5 line-clamp-1">{n.message}</p>
                            <p className="text-slate-400 mt-0.5 text-[10px]">{formatNotifTime(n.created_at)}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifs(false)}
                  className="block p-2.5 text-center text-xs font-semibold text-teal-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifs(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Avatar name={user?.name} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight truncate max-w-[100px] text-slate-900">{user?.name}</p>
                <p className="text-[10px] uppercase text-slate-500 tracking-wider">{role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-[0_8px_24px_-4px_rgba(15,23,42,0.14)] border border-slate-200 py-1.5 z-50 animate-scale-up">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{user?.email}</p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" /> Settings
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
