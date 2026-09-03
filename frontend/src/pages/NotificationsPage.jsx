import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, AlertOctagon, AlertTriangle, MessageSquare, Briefcase, CreditCard, Info, RefreshCw } from 'lucide-react';
import api from '../api/client';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, risk_alert, sms, payment

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === 'unread') params.append('unread', 'true');
      else if (filter !== 'all') params.append('type', filter);
      const res = await api.get(`/notifications?${params}`);
      if (res.success && res.data) {
        setNotifications(res.data.notifications || res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [filter]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const typeIcon = {
    risk_alert: { icon: AlertOctagon, color: 'text-rose-600 bg-rose-50' },
    risk_update: { icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
    sms_received: { icon: MessageSquare, color: 'text-sky-600 bg-sky-50' },
    job_match: { icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
    payment: { icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
    system: { icon: Info, color: 'text-slate-600 bg-slate-50' }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-blue-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-black">{unreadCount}</span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">Risk alerts, SMS events, job matches, and payment confirmations</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchNotifications} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={markAllRead} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-emerald-600" /> Mark All Read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'risk_alert', label: 'Risk Alerts' },
          { key: 'sms_received', label: 'SMS Check-ins' },
          { key: 'payment', label: 'Payments' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              filter === f.key
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <LoadingSkeleton type="card" count={5} />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="All caught up! Notifications appear here when risk alerts trigger, SMS check-ins arrive, and payouts are dispatched." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
          {notifications.map(notif => {
            const typeConf = typeIcon[notif.type] || typeIcon.system;
            const Icon = typeConf.icon;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markRead(notif.id)}
                className={`flex items-start gap-4 p-5 cursor-pointer transition-colors hover:bg-slate-50 ${!notif.is_read ? 'bg-blue-50/40' : ''}`}
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${typeConf.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm ${!notif.is_read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                      <span className="text-2xs text-slate-400 font-mono whitespace-nowrap">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

