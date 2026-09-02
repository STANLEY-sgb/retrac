import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, RefreshCw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useNotifications } from '../context/NotificationContext';

export default function CheckinsPage() {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const { addToast } = useNotifications();

  const fetchCheckins = async () => {
    try {
      const res = await api.get('/checkins');
      if (res.success && res.data) {
        setCheckins(res.data.checkins || res.data);
      }
    } catch (err) {
      console.error('Failed to load check-ins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckins();
  }, []);

  const handleBroadcast = async () => {
    setBroadcasting(true);
    try {
      const res = await api.post('/checkins/broadcast');
      if (res.success) {
        addToast('Broadcast Sent', `Weekly SMS check-ins dispatched to all active clients.`, 'success');
        fetchCheckins();
      }
    } catch (err) {
      addToast('Error', err.message || 'Broadcast failed', 'danger');
    } finally {
      setBroadcasting(false);
    }
  };

  const sentimentColor = {
    positive: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200',
    negative: 'bg-rose-50 text-rose-800 border-rose-200',
    distress: 'bg-red-50 text-red-900 border-red-200 font-bold'
  };

  const responseLabel = (code) => {
    if (code === '1') return { text: '1 — Stable', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (code === '2') return { text: '2 — Struggling', cls: 'text-rose-700 bg-rose-50 border-rose-200 font-bold' };
    return { text: 'Free-text', cls: 'text-sky-700 bg-sky-50 border-sky-200' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">SMS Check-In Logs</h1>
          <p className="text-xs text-slate-500 mt-1">Weekly SMS response history, sentiment analysis, and compliance tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCheckins}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleBroadcast}
            disabled={broadcasting}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {broadcasting ? 'Sending...' : 'Broadcast Weekly Check-In'}
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-3xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-4">Scheduled Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Response Code</th>
                  <th className="py-3.5 px-4">Sentiment</th>
                  <th className="py-3.5 px-4">SMS Text</th>
                  <th className="py-3.5 px-4">Received At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {checkins.map(c => {
                  const resp = c.response_code ? responseLabel(c.response_code) : null;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-teal-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {(c.client_name || 'U').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{c.client_name || 'Unknown'}</p>
                            <p className="text-3xs text-slate-400 font-mono">{c.phone_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-medium">{c.scheduled_date}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        {resp ? (
                          <span className={`px-2 py-0.5 rounded-lg border text-2xs font-semibold ${resp.cls}`}>
                            {resp.text}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-2xs">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {c.sentiment ? (
                          <span className={`px-2 py-0.5 rounded-lg border text-2xs font-semibold capitalize ${sentimentColor[c.sentiment] || sentimentColor.neutral}`}>
                            {c.sentiment}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-2xs italic">n/a</span>
                        )}
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        {c.response_raw ? (
                          <p className="text-slate-700 truncate bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 font-mono text-2xs">
                            "{c.response_raw}"
                          </p>
                        ) : (
                          <span className="text-slate-400 italic text-2xs">No reply</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-2xs font-mono">
                        {c.received_at ? new Date(c.received_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
