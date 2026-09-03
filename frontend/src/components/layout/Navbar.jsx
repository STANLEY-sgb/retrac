import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, LogOut, ChevronDown, Menu, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../ui/Avatar';

export default function Navbar({ onToggleMobileSidebar }) {
  const { user, role, logout, quickLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onToggleMobileSidebar} className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo.svg" alt="ReTrac" className="w-7 h-7" />
            <span className="text-lg font-extrabold tracking-tight">
              Re<span className="text-teal-600">Trac</span>
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search clients, jobs, or reference numbers..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-teal-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Role Switcher */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl text-[11px] font-semibold border border-slate-200/60">
            {[
              { id: 'caseworker', label: 'Caseworker' },
              { id: 'admin', label: 'Admin' },
              { id: 'employer', label: 'Employer' }
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => quickLogin(r.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === r.id
                    ? 'bg-white shadow-sm text-teal-900 border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-scale-up">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold">Alerts</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-teal-700 font-semibold">Mark read</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400">No alerts</div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`w-full text-left p-3 text-xs hover:bg-slate-50 ${n.is_read ? 'opacity-60' : 'bg-sky-50/40'}`}
                      >
                        <p className="font-bold text-slate-800">{n.title}</p>
                        <p className="text-slate-500 mt-0.5 line-clamp-1">{n.message}</p>
                      </button>
                    ))
                  )}
                </div>
                <Link to="/notifications" onClick={() => setShowNotifs(false)} className="block p-2 text-center text-xs font-semibold text-teal-700 bg-slate-50">
                  View all
                </Link>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100">
              <Avatar name={user?.name} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight truncate max-w-[110px]">{user?.name}</p>
                <p className="text-[10px] uppercase text-slate-500">{role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-scale-up">
                <Link to="/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50">
                  <User className="w-4 h-4 text-slate-400" /> Settings
                </Link>
                <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
