import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon, AlertTriangle, CheckCircle2, HeartHandshake,
  RefreshCw, ChevronRight, Clock, TrendingDown, X
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { useNotifications } from '../context/NotificationContext';

export default function RiskAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveDescription, setResolveDescription] = useState('Phone call completed. Client stabilized and received peer support referral.');
  const [resolveAction, setResolveAction] = useState('Conducted 30-minute motivational counseling call.');
  const [resolving, setResolving] = useState(false);
  const { addToast } = useNotifications();

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/risk/alerts?status=active');
      if (res.success && res.data) {
        setAlerts(res.data.alerts || res.data);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const openResolve = (alert) => {
    setSelectedAlert(alert);
    setShowResolveModal(true);
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;
    setResolving(true);
    try {
      await api.post('/interventions', {
        client_id: selectedAlert.client_id,
        type: 'phone_call',
        description: resolveDescription,
        action_taken: resolveAction,
        outcome: 'successful',
        resolve_active_alert: true
      });
      addToast('Alert Resolved', `Risk alert for ${selectedAlert.client_name} resolved and stabilized.`, 'success');
      setShowResolveModal(false);
      fetchAlerts();
    } catch (err) {
      addToast('Error', err.message || 'Failed to resolve alert', 'danger');
    } finally {
      setResolving(false);
    }
  };

  const levelIcon = { CRITICAL: AlertOctagon, AT_RISK: AlertTriangle, MONITOR: AlertTriangle };
  const levelColor = {
    CRITICAL: 'bg-red-50 border-red-200 text-red-900',
    AT_RISK: 'bg-orange-50 border-orange-200 text-orange-900',
    MONITOR: 'bg-amber-50 border-amber-200 text-amber-900'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Active Risk Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">Patients requiring immediate caseworker intervention</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No active risk alerts"
          description="All clients are currently stable or monitor-level. Check back after the next weekly check-in cycle."
        />
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => {
            const Icon = levelIcon[alert.level] || AlertTriangle;
            const cardCls = levelColor[alert.level] || levelColor.MONITOR;
            return (
              <div key={alert.id} className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-start gap-4 ${cardCls}`}>
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 rounded-xl bg-white/60 flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black">{alert.client_name}</h3>
                      <StatusBadge status={alert.level} size="sm" />
                      <span className="text-xs font-bold opacity-80">Score: {alert.score}/100</span>
                    </div>
                    <p className="text-xs font-mono opacity-70 mt-0.5">{alert.phone_number}</p>

                    {/* Reasons list */}
                    {alert.reasons && alert.reasons.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-2xs font-extrabold uppercase tracking-wider opacity-70">Risk Factors (Explainable AI):</p>
                        {alert.reasons.map((r, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs">
                            <TrendingDown className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-2xs opacity-60 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Alert raised: {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/clients/${alert.client_id}`}
                    className="px-3.5 py-2 rounded-xl bg-white/70 hover:bg-white text-slate-800 text-xs font-bold border border-white/40 transition-all flex items-center gap-1.5"
                  >
                    View Profile <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => openResolve(alert)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    Resolve & Log Intervention
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve Modal */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title={`Resolve Alert & Log Intervention`}
        subtitle={selectedAlert ? `Stabilizing ${selectedAlert.client_name} (${selectedAlert.level})` : ''}
      >
        <form onSubmit={handleResolve} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Intervention Summary</label>
            <input
              type="text"
              required
              value={resolveDescription}
              onChange={(e) => setResolveDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Action Taken</label>
            <textarea
              rows={3}
              required
              value={resolveAction}
              onChange={(e) => setResolveAction(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-2xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Saving this intervention will automatically resolve the active risk alert and recalculate the recovery score.
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setShowResolveModal(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold">Cancel</button>
            <button type="submit" disabled={resolving} className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold disabled:opacity-50">
              {resolving ? 'Saving...' : 'Resolve Alert & Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
