import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Phone, MapPin, ArrowLeft, HeartHandshake, Send, Briefcase, Wallet,
  UserPlus, MessageSquare, ShieldAlert, CheckCircle2, UserCheck
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import Avatar from '../components/ui/Avatar';
import RiskRing from '../components/ui/RiskRing';
import JourneyStrip from '../components/ui/JourneyStrip';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { parseReasons } from '../lib/visual';

const JOURNEY = [
  { label: 'Enrolled', icon: UserPlus },
  { label: 'Check-ins', icon: MessageSquare },
  { label: 'Alert', icon: ShieldAlert },
  { label: 'Care', icon: HeartHandshake },
  { label: 'Job', icon: Briefcase },
  { label: 'Paid', icon: Wallet },
];

export default function ClientDetailPage() {
  const { id } = useParams();
  const { addToast } = useNotifications();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [intvType, setIntvType] = useState('phone_call');
  const [intvDescription, setIntvDescription] = useState('Follow-up completed.');
  const [intvAction, setIntvAction] = useState('Counseling call completed.');
  const [intvOutcome, setIntvOutcome] = useState('successful');
  const [intvNotes, setIntvNotes] = useState('');
  const [submittingIntv, setSubmittingIntv] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);

  // Caseworker Assignment State
  const { role } = useAuth();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [caseworkersList, setCaseworkersList] = useState([]);
  const [selectedCaseworker, setSelectedCaseworker] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const fetchClientData = async () => {
    try {
      const res = await api.get(`/clients/${id}`);
      if (res.success && res.data) {
        setData(res.data);
        if (res.data.client?.assigned_caseworker_id) {
          setSelectedCaseworker(res.data.client.assigned_caseworker_id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async () => {
    setIsAssignModalOpen(true);
    try {
      const res = await api.get('/clients/caseworkers');
      if (res.success && res.data) {
        setCaseworkersList(res.data.caseworkers || []);
      }
    } catch (err) {
      console.error('Failed to load caseworkers:', err);
    }
  };

  const handleAssignCaseworker = async (e) => {
    e.preventDefault();
    if (!selectedCaseworker) return;
    setSubmittingAssign(true);
    try {
      const res = await api.put(`/clients/${id}/assign`, { caseworkerId: selectedCaseworker });
      if (res.success) {
        addToast('Assigned', res.message || 'Caseworker updated successfully.', 'success');
        setIsAssignModalOpen(false);
        fetchClientData();
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed to assign caseworker', 'danger');
    } finally {
      setSubmittingAssign(false);
    }
  };

  useEffect(() => { fetchClientData(); }, [id]);

  const handleSendCheckin = async () => {
    setSendingSms(true);
    try {
      const res = await api.post(`/checkins/send/${id}`);
      if (res.success) {
        addToast('Sent', 'Check-in SMS dispatched', 'success');
        fetchClientData();
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed', 'danger');
    } finally {
      setSendingSms(false);
    }
  };

  const handleRecordIntervention = async (e) => {
    e.preventDefault();
    setSubmittingIntv(true);
    try {
      const res = await api.post('/interventions', {
        client_id: id,
        type: intvType,
        description: intvDescription,
        action_taken: intvAction,
        outcome: intvOutcome,
        notes: intvNotes,
        resolve_active_alert: true
      });
      if (res.success) {
        addToast('Logged', 'Intervention saved', 'success');
        setIsInterventionModalOpen(false);
        fetchClientData();
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed', 'danger');
    } finally {
      setSubmittingIntv(false);
    }
  };

  if (loading) return <LoadingSkeleton type="card" count={3} />;
  if (!data?.client) {
    return <EmptyState title="Not found" actionLabel="Clients" onAction={() => { window.location.href = '/clients'; }} />;
  }

  const { client, checkins = [], riskHistory = [], interventions = [], applications = [], payments = [] } = data;
  const hasAlert = ['AT_RISK', 'CRITICAL'].includes(String(client.current_risk_level).toUpperCase());
  const hasJob = applications.some((a) => ['accepted', 'completed', 'matched'].includes(String(a.status).toLowerCase()));
  const hasPay = payments.length > 0;
  const journeyIdx = hasPay ? 5 : hasJob ? 4 : interventions.length ? 3 : hasAlert ? 2 : checkins.length ? 1 : 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'checkins', label: 'Check-ins' },
    { id: 'risk', label: 'Risk' },
    { id: 'interventions', label: 'Care' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'payments', label: 'Pay' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/clients" className="p-2 rounded-xl bg-white border border-slate-200"><ArrowLeft className="w-4 h-4" /></Link>
          <Avatar name={client.full_name} size="lg" />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold">{client.full_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={client.current_risk_level} size="sm" />
              <span className="text-sm font-bold text-slate-500">{client.current_risk_score}/100</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSendCheckin} disabled={sendingSms} className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
          <button onClick={() => setIsInterventionModalOpen(true)} className="px-3 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4" /> Care
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 overflow-x-auto">
        <JourneyStrip steps={JOURNEY} current={journeyIdx} />
      </div>

      <div className="flex gap-1 overflow-x-auto bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${activeTab === t.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <div className="flex items-center gap-2.5 text-slate-700">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Assigned Caseworker</span>
                  <span className="font-bold text-xs text-slate-900">{client.caseworker_name || 'Unassigned'}</span>
                </div>
              </div>
              {['admin', 'caseworker'].includes(role) && (
                <button
                  type="button"
                  onClick={openAssignModal}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                >
                  {client.caseworker_name ? 'Reassign' : 'Assign Staff'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-600"><Phone className="w-4 h-4" /> {client.phone_number}</div>
            <div className="flex items-center gap-2 text-slate-600"><MapPin className="w-4 h-4" /> {client.location}</div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {(client.skills || []).map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold">{s.name}</span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <RiskRing score={client.current_risk_score} level={client.current_risk_level} reasons={client.activeAlert?.reasons} />
          </div>
        </div>
      )}

      {activeTab === 'checkins' && (
        <div className="space-y-2">
          {checkins.length === 0 ? <EmptyState icon={MessageSquare} title="No check-ins" /> : checkins.map((chk) => (
            <div key={chk.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between">
              <div>
                <StatusBadge status={chk.status} size="sm" />
                <p className="text-sm font-semibold mt-1">{chk.response_raw || '—'}</p>
              </div>
              <span className="text-[11px] text-slate-400">{chk.scheduled_date}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <RiskRing score={client.current_risk_score} level={client.current_risk_level} reasons={parseReasons(client.activeAlert?.reasons)} />
          <div className="mt-6 space-y-2">
            {(riskHistory || []).slice(0, 6).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs">
                <StatusBadge status={r.risk_level || r.level} size="sm" />
                <span className="font-bold">{r.score ?? r.risk_score}</span>
                <span className="text-slate-400">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'interventions' && (
        <div className="space-y-2">
          {interventions.length === 0 ? <EmptyState icon={HeartHandshake} title="No care logged" /> : interventions.map((i) => (
            <div key={i.id} className="bg-white rounded-2xl border border-slate-200/80 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold capitalize">{(i.type || '').replace('_', ' ')}</p>
                <StatusBadge status={i.outcome} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-1">{i.description}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-2">
          {applications.length === 0 ? <EmptyState icon={Briefcase} title="No jobs" actionLabel="Match" onAction={() => { window.location.href = '/job-matches'; }} /> : applications.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">{app.job_title}</p>
                <p className="text-[11px] text-slate-500">{app.match_score}% match</p>
              </div>
              <StatusBadge status={app.status} size="sm" />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-2">
          {payments.length === 0 ? <EmptyState icon={Wallet} title="No payments" /> : payments.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs font-bold text-teal-800">{p.transaction_reference}</p>
                <StatusBadge status={p.status} size="sm" />
              </div>
              <p className="font-extrabold">UGX {Number(p.amount).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isInterventionModalOpen} onClose={() => setIsInterventionModalOpen(false)} title="Log care">
        <form onSubmit={handleRecordIntervention} className="space-y-3 text-sm">
          <select value={intvType} onChange={(e) => setIntvType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <option value="phone_call">Phone</option>
            <option value="in_person">Visit</option>
            <option value="counseling">Counseling</option>
            <option value="family_support">Family</option>
            <option value="employment_support">Jobs</option>
            <option value="referral">Referral</option>
          </select>
          <input required value={intvDescription} onChange={(e) => setIntvDescription(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Note" />
          <textarea required rows={2} value={intvAction} onChange={(e) => setIntvAction(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
          <select value={intvOutcome} onChange={(e) => setIntvOutcome(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <option value="successful">Successful</option>
            <option value="pending">Pending</option>
            <option value="escalated">Escalated</option>
          </select>
          <button type="submit" disabled={submittingIntv} className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold disabled:opacity-50">
            {submittingIntv ? 'Saving…' : 'Save'}
          </button>
        </form>
      </Modal>

      {/* Caseworker Assignment Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Recovery Caseworker">
        <form onSubmit={handleAssignCaseworker} className="space-y-4 text-xs">
          <p className="text-slate-500">
            Assign <span className="font-bold text-slate-800">{client.full_name}</span> to a licensed caseworker for weekly check-in monitoring and aftercare interventions.
          </p>
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Caseworker</label>
            <select
              required
              value={selectedCaseworker}
              onChange={(e) => setSelectedCaseworker(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">-- Choose Caseworker --</option>
              {caseworkersList.map((cw) => (
                <option key={cw.id} value={cw.id}>
                  {cw.full_name} • {cw.title} ({cw.active_client_count || 0} active clients)
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAssign || !selectedCaseworker}
              className="px-5 py-2 rounded-xl bg-[#082f49] hover:bg-[#0c4a6e] text-white font-bold disabled:opacity-50 transition-colors"
            >
              {submittingAssign ? 'Saving...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
