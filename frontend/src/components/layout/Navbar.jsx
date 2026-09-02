import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, LogOut, ShieldAlert, Sparkles, Check, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import StatusBadge from '../common/StatusBadge';

export default function Navbar({ onToggleMobileSidebar }) {
  const { user, role, logout, quickLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="ReTrac" className="w-8 h-8 flex-shrink-0" />
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Re<span className="text-teal-600">Trac</span>
              </span>
            </div>
          </Link>

          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Uganda Track 05
          </span>
        </div>

        {/* Right: Quick Role Switcher + Notification Bell + User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Demo Switcher */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <span className="text-2xs font-bold text-slate-500 uppercase px-2">Role Switch:</span>
            <button
              onClick={() => quickLogin('caseworker')}
              className={`px-2 py-1 rounded font-medium transition-colors ${role === 'caseworker' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Caseworker
            </button>
            <button
              onClick={() => quickLogin('admin')}
              className={`px-2 py-1 rounded font-medium transition-colors ${role === 'admin' ? 'bg-white shadow-xs text-purple-700 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Admin
            </button>
            <button
              onClick={() => quickLogin('employer')}
              className={`px-2 py-1 rounded font-medium transition-colors ${role === 'employer' ? 'bg-white shadow-xs text-teal-700 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Employer
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-3xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-scale-up">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-2xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 8).map(n => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${n.is_read ? 'opacity-70' : 'bg-sky-50/40'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-slate-800">{n.title}</p>
                          <span className="text-3xs text-slate-400">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifs(false)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user?.name || 'User'}</p>
                <p className="text-3xs font-semibold uppercase text-slate-500 tracking-wider">{role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-scale-up">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-2xs text-slate-500 truncate">{user?.email}</p>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-400" /> System Settings
                </Link>

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
