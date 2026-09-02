import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Calendar,
  Building,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  HeartHandshake,
  MessageSquare,
  Briefcase,
  CreditCard,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  ArrowLeft,
  AlertOctagon,
  FileText
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import RiskScoreGauge from '../components/common/RiskScoreGauge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useNotifications } from '../context/NotificationContext';

export default function ClientDetailPage() {
  const { id } = useParams();
  const { addToast } = useNotifications();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, checkins, jobs, payments

  // Intervention Modal State
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [intvType, setIntvType] = useState('phone_call');
  const [intvDescription, setIntvDescription] = useState('Follow-up call completed regarding recovery status.');
  const [intvAction, setIntvAction] = useState('Conducted 20-minute motivational counseling and verified support system.');
  const [intvOutcome, setIntvOutcome] = useState('successful');
  const [intvNotes, setIntvNotes] = useState('');
  const [submittingIntv, setSubmittingIntv] = useState(false);

  // Send SMS State
  const [sendingSms, setSendingSms] = useState(false);

  const fetchClientData = async () => {
    try {
      const res = await api.get(`/clients/${id}`);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load client:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const handleSendCheckin = async () => {
    setSendingSms(true);
    try {
      const res = await api.post(`/checkins/send/${id}`);
      if (res.success) {
        addToast('Check-in Sent', `Weekly check-in SMS dispatched to ${data.client.full_name}`, 'success');
        fetchClientData();
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed to dispatch SMS checkin', 'danger');
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
        addToast('Intervention Logged', 'Caseworker follow-up saved and risk alert resolved.', 'success');
        setIsInterventionModalOpen(false);
        fetchClientData();
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed to log intervention', 'danger');
    } finally {
      setSubmittingIntv(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (!data?.client) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-800">Client not found</h3>
        <Link to="/clients" className="text-xs text-blue-600 font-semibold mt-2 inline-block">
          &larr; Return to Client List
        </Link>
      </div>
    );
  }

  const { client, checkins, riskHistory, interventions, applications, payments } = data;

  // Combine interventions and check-ins into chronological timeline
  const timelineEvents = [
    ...checkins.map(c => ({
      id: c.id,
      type: 'checkin',
      date: c.sent_at,
      title: `Weekly SMS Check-In: ${c.status === 'received' ? (c.response_code === '1' ? 'Stable Reply "1"' : c.response_code === '2' ? 'Struggling Reply "2"' : 'Free-Text Response') : 'Missed Response'}`,
      description: c.response_raw ? `"${c.response_raw}"` : 'No response received within weekly window.',
      status: c.status,
      sentiment: c.sentiment
    })),
    ...interventions.map(i => ({
      id: i.id,
      type: 'intervention',
      date: i.performed_at,
      title: `Caseworker Intervention (${i.type.replace('_', ' ')})`,
      description: `${i.description} — Action taken: ${i.action_taken}`,
      status: i.outcome,
      by: i.caseworker_name
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/clients"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {client.full_name}
              </h1>
              <StatusBadge status={client.current_risk_level} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enrolled: {client.enrollment_date} &bull; Recovery Start: {client.recovery_start_date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendCheckin}
            disabled={sendingSms}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-sky-600" />
            <span>{sendingSms ? 'Sending...' : 'Send SMS Prompt'}</span>
          </button>

          <button
            onClick={() => setIsInterventionModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Record Intervention</span>
          </button>
        </div>
      </div>

      {/* Profile Overview & Risk Assessment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Client Demographic & Clinical Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Patient Profile & Care Team
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Phone Number (SMS Receiver):</span>
                <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{client.phone_number}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Treatment & Recovery Centre:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{client.treatment_centre}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Location / District:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{client.location}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Assigned Caseworker:</span>
                <p className="font-semibold text-blue-700 mt-0.5">{client.caseworker_name || 'Bwambale Sulait'}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Preferred Job Category:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{client.preferred_job_category || 'Logistics & Retail'}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Emergency / Family Contact:</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {client.emergency_contact_name} ({client.emergency_contact_phone})
                </p>
              </div>
            </div>

            {/* Skills Tags */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-2">Acquired Vocational Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {client.skills && client.skills.length > 0 ? (
                  client.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold">
                      {s.name}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs italic">No skills linked</span>
                )}
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <span className="font-bold text-slate-700">Caseworker Clinical Notes:</span> {client.notes}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Explainable Risk Gauge Card */}
        <div className="lg:col-span-1">
          <RiskScoreGauge
            score={client.current_risk_score}
            level={client.current_risk_level}
            reasons={client.activeAlert?.reasons || ['Consistent weekly check-in compliance and positive recovery trajectory']}
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'timeline'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Care Timeline & History ({timelineEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('checkins')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'checkins'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          SMS Check-Ins ({checkins.length})
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'jobs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Work Placements ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Mobile Money Payouts ({payments.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        {/* TAB 1: Care Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Integrated Recovery & Intervention History</h4>
            {timelineEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No events recorded yet.</p>
            ) : (
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                {timelineEvents.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative">
                    {/* Dot */}
                    <div
                      className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                        evt.type === 'intervention'
                          ? 'bg-teal-500'
                          : evt.status === 'received' && evt.title.includes('Struggling')
                          ? 'bg-rose-500'
                          : evt.status === 'missed'
                          ? 'bg-red-500'
                          : 'bg-emerald-500'
                      }`}
                    />

                    <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-900">{evt.title}</span>
                        <span className="text-3xs text-slate-400 font-mono">
                          {new Date(evt.date).toLocaleDateString()} &bull; {new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{evt.description}</p>
                      {evt.by && (
                        <p className="text-3xs text-slate-500 mt-2 font-medium">Logged by: {evt.by}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Check-ins */}
        {activeTab === 'checkins' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900">SMS Check-in Logs</h4>
            <div className="divide-y divide-slate-100">
              {checkins.map(chk => (
                <div key={chk.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Scheduled: {chk.scheduled_date}</span>
                      <StatusBadge status={chk.status} size="sm" />
                    </div>
                    <p className="text-slate-600 mt-1 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {chk.response_raw ? `Reply: "${chk.response_raw}"` : 'No reply received.'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xs text-slate-400 block">Sent: {new Date(chk.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {chk.sentiment && (
                      <span className="text-2xs font-semibold text-slate-700 capitalize mt-1 block">
                        Sentiment: {chk.sentiment}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Jobs */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Reintegration Placements & Applications</h4>
              <Link to="/job-matches" className="text-xs font-bold text-blue-600 hover:underline">
                View Automated Job Matches &rarr;
              </Link>
            </div>

            {applications.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No current job placements.</p>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{app.job_title}</h5>
                      <p className="text-slate-500 mt-0.5">{app.employer_name} &bull; {app.job_location}</p>
                      <p className="text-2xs text-slate-400 mt-1">Match Score: {app.match_score}%</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={app.status} size="sm" />
                      <p className="font-bold text-slate-800 mt-2">UGX {Number(app.pay_amount).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Payments */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Mobile Money Disbursements</h4>
            {payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No payouts issued yet.</p>
            ) : (
              <div className="space-y-3">
                {payments.map(p => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-teal-800">{p.transaction_reference}</span>
                      <p className="text-slate-600 mt-0.5">{p.notes}</p>
                      <p className="text-3xs text-slate-400 mt-1">
                        Disbursed: {new Date(p.completed_at || p.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={p.status} size="sm" />
                      <p className="font-extrabold text-slate-900 text-sm mt-1">
                        UGX {Number(p.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Record Intervention Modal */}
      <Modal
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        title="Record Caseworker Intervention"
        subtitle={`Document care action and stabilize recovery for ${client.full_name}`}
      >
        <form onSubmit={handleRecordIntervention} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Intervention Modality
            </label>
            <select
              value={intvType}
              onChange={(e) => setIntvType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="phone_call">📞 Direct Phone Counseling Call</option>
              <option value="in_person">🤝 In-Person Clinical / Field Session</option>
              <option value="counseling">🧠 One-on-One Relapse Prevention Therapy</option>
              <option value="family_support">👨‍👩‍👧 Family & Social Support Outreach</option>
              <option value="employment_support">💼 Employment & Skills Assistance</option>
              <option value="referral">🏥 Medical / Centre Referral</option>
              <option value="other">📋 Other Supportive Action</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Brief Description
            </label>
            <input
              type="text"
              required
              value={intvDescription}
              onChange={(e) => setIntvDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Urgent follow-up after struggling check-in response."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Action Taken & Clinical Support Provided
            </label>
            <textarea
              rows={3}
              required
              value={intvAction}
              onChange={(e) => setIntvAction(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed steps taken during session..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Outcome
              </label>
              <select
                value={intvOutcome}
                onChange={(e) => setIntvOutcome(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
              >
                <option value="successful">Successful / Stabilized</option>
                <option value="pending">Pending Follow-up</option>
                <option value="escalated">Escalated to Medical Officer</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Risk Alert Action
              </label>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-2xs font-semibold flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Auto-resolve active risk alerts</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInterventionModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingIntv}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20 disabled:opacity-50"
            >
              {submittingIntv ? 'Saving...' : 'Save & Stabilize Risk'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
