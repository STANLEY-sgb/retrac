import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Avatar from '../components/ui/Avatar';
import { parseReasons, riskTone } from '../lib/visual';
import { useNotifications } from '../context/NotificationContext';

export default function RiskAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveDescription, setResolveDescription] = useState('Stabilized after call.');
  const [resolveAction, setResolveAction] = useState('Counseling call.');
  const [resolving, setResolving] = useState(false);
  const { addToast } = useNotifications();

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/risk/alerts?status=active');
      if (res.success && res.data) setAlerts(res.data.alerts || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

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
      addToast('Resolved', selectedAlert.client_name, 'success');
      setShowResolveModal(false);
      fetchAlerts();
    } catch (err) {
      addToast('Error', err.message || 'Failed', 'danger');
    } finally {
      setResolving(false);
    }
  };

  const groups = {
    CRITICAL: alerts.filter((a) => String(a.risk_level || a.level).toUpperCase() === 'CRITICAL'),
    AT_RISK: alerts.filter((a) => ['AT_RISK', 'AT RISK'].includes(String(a.risk_level || a.level).toUpperCase())),
    MONITOR: alerts.filter((a) => String(a.risk_level || a.level).toUpperCase() === 'MONITOR'),
  };

  const Board = ({ title, items, tone }) => (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 min-h-[200px]">
      <p className={`text-[11px] font-extrabold uppercase tracking-wider mb-3 ${tone}`}>{title} Â· {items.length}</p>
      <div className="space-y-2">
        {items.map((alert) => {
          const score = alert.risk_score ?? alert.score ?? 0;
          const reasons = parseReasons(alert.reasons);
          return (
            <div key={alert.id} className="p-3 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2">
                <Avatar name={alert.client_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{alert.client_name}</p>
                  <p className="text-[11px] font-extrabold">{score}/100</p>
                </div>
              </div>
              {reasons[0] && <p className="text-[11px] text-slate-500 mt-2 truncate">{reasons[0]}</p>}
              <div className="flex gap-2 mt-2">
                <Link to={`/clients/${alert.client_id}`} className="flex-1 text-center py-1.5 rounded-lg bg-white text-[11px] font-bold border border-slate-200">View</Link>
                <button onClick={() => { setSelectedAlert(alert); setShowResolveModal(true); }} className="flex-1 py-1.5 rounded-lg bg-[#082f49] text-white text-[11px] font-bold">Care</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Risk Alerts" subtitle="Active relapse risk flags requiring caseworker intervention" actions={<button onClick={fetchAlerts} className="p-2.5 rounded-xl bg-white border border-slate-200"><RefreshCw className="w-4 h-4" /></button>} />
      {loading ? <LoadingSkeleton type="card" count={3} /> : alerts.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="All clear" />
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <Board title="Critical" items={groups.CRITICAL} tone="text-rose-600" />
          <Board title="At Risk" items={groups.AT_RISK} tone="text-orange-600" />
          <Board title="Monitor" items={groups.MONITOR} tone="text-amber-600" />
        </div>
      )}
      <Modal isOpen={showResolveModal} onClose={() => setShowResolveModal(false)} title="Log care">
        <form onSubmit={handleResolve} className="space-y-3">
          <input value={resolveDescription} onChange={(e) => setResolveDescription(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm" />
          <textarea rows={2} value={resolveAction} onChange={(e) => setResolveAction(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm" />
          <button type="submit" disabled={resolving} className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold">{resolving ? 'Savingâ€¦' : 'Resolve'}</button>
        </form>
      </Modal>
    </div>
  );
}

