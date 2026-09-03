import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase, MapPin, DollarSign, Users, ArrowLeft, CheckCircle2,
  XCircle, CreditCard, Clock, Star, ChevronRight, Award
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useNotifications } from '../context/NotificationContext';

export default function JobDetailPage() {
  const { id } = useParams();
  const { addToast } = useNotifications();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payoutModal, setPayoutModal] = useState(null); // holds application for payout
  const [payoutProvider, setPayoutProvider] = useState('demo');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);
  const [processingAccept, setProcessingAccept] = useState(null);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      if (res.success && res.data) setData(res.data);
    } catch (err) {
      console.error('Failed to load job:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJob(); }, [id]);

  const handleAccept = async (applicationId) => {
    setProcessingAccept(applicationId);
    try {
      const res = await api.patch(`/applications/${applicationId}/status`, { status: 'accepted' });
      if (res.success) {
        addToast('Application Accepted', 'Client has been accepted for this position.', 'success');
        fetchJob();
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed to accept application', 'danger');
    } finally {
      setProcessingAccept(null);
    }
  };

  const handleMarkComplete = async (applicationId) => {
    try {
      const res = await api.patch(`/applications/${applicationId}/status`, { status: 'completed' });
      if (res.success) {
        addToast('Work Marked Complete', 'Ready to trigger Mobile Money payout.', 'success');
        fetchJob();
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed to mark complete', 'danger');
    }
  };

  const openPayout = (app) => {
    setPayoutModal(app);
    setPayoutAmount(data?.job?.pay_amount || '');
  };

  const handlePayout = async (e) => {
    e.preventDefault();
    if (!payoutModal) return;
    setProcessingPayout(true);
    try {
      const res = await api.post('/payments/disburse', {
        application_id: payoutModal.id,
        client_id: payoutModal.client_id,
        amount: parseFloat(payoutAmount),
        provider: payoutProvider,
        notes: `Job completion payout: ${data?.job?.title}`
      });
      if (res.success) {
        const ref = res.data?.reference || res.data?.transaction_reference || 'RTR-2026-COMPLETED';
        addToast(
          'Payout Dispatched!',
          `${ref} — UGX ${Number(payoutAmount).toLocaleString()} via ${payoutProvider.toUpperCase()}`,
          'success'
        );
        setPayoutModal(null);
        fetchJob();
      }
    } catch (err) {
      addToast('Error', err.message || 'Payout failed', 'danger');
    } finally {
      setProcessingPayout(false);
    }
  };

  if (loading) return <LoadingSkeleton type="card" count={3} />;
  if (!data?.job) return <div className="text-center py-16 text-slate-500">Job not found.</div>;

  const { job, applications } = data;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link to="/jobs" className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{job.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{job.employer_name} &bull; {job.location}</p>
        </div>
      </div>

      {/* Job Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-emerald-50 rounded-xl">
            <p className="text-emerald-700 font-bold uppercase tracking-wider text-3xs">Pay Rate</p>
            <p className="text-lg font-black text-emerald-900 mt-1">
              UGX {Number(job.pay_amount).toLocaleString()}
            </p>
            <p className="text-emerald-600 capitalize">per {job.pay_frequency?.replace('_', ' ')}</p>
          </div>
          <div className="p-4 bg-sky-50 rounded-xl">
            <p className="text-sky-700 font-bold uppercase tracking-wider text-3xs">Category</p>
            <p className="font-bold text-sky-900 mt-1">{job.category}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-slate-600 font-bold uppercase tracking-wider text-3xs">Status</p>
            <div className="mt-1"><StatusBadge status={job.status || 'open'} size="sm" /></div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="text-purple-700 font-bold uppercase tracking-wider text-3xs">Applications</p>
            <p className="text-lg font-black text-purple-900 mt-1">{applications?.length || 0}</p>
          </div>
        </div>
        {job.description && (
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-700 leading-relaxed">
            <p className="font-bold text-slate-900 mb-1">Job Description:</p>
            <p>{job.description}</p>
          </div>
        )}
      </div>

      {/* Applicants */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          Candidate Applicants ({applications?.length || 0})
        </h3>

        {!applications || applications.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">No applications yet. Use the Job Matcher to recommend candidates.</p>
        ) : (
          <div className="space-y-3">
            {applications.map(app => (
              <div key={app.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 font-black flex items-center justify-center text-sm">
                    {(app.client_name || 'C').charAt(0)}
                  </div>
                  <div className="text-xs">
                    <Link to={`/clients/${app.client_id}`} className="font-bold text-slate-900 hover:text-blue-600">
                      {app.client_name}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <Star className="w-3 h-3" /> {app.match_score}% Match
                      </span>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {app.status === 'pending' && (
                    <button
                      onClick={() => handleAccept(app.id)}
                      disabled={processingAccept === app.id}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {processingAccept === app.id ? 'Accepting...' : 'Accept'}
                    </button>
                  )}
                  {app.status === 'accepted' && (
                    <button
                      onClick={() => handleMarkComplete(app.id)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Mark Work Complete
                    </button>
                  )}
                  {app.status === 'completed' && !app.payment_id && (
                    <button
                      onClick={() => openPayout(app)}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Trigger Mobile Money Payout
                    </button>
                  )}
                  {app.payment_id && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Paid Out
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Modal */}
      <Modal isOpen={!!payoutModal} onClose={() => setPayoutModal(null)} title="Trigger Mobile Money Payout" subtitle={payoutModal ? `Pay ${payoutModal.client_name} for completed work` : ''}>
        <form onSubmit={handlePayout} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Amount (UGX)</label>
            <input type="number" required value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Provider</label>
            <select value={payoutProvider} onChange={(e) => setPayoutProvider(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
              <option value="demo">🧪 Demo Mode (Instant Sandbox)</option>
              <option value="mtn_momo">📱 MTN Mobile Money Uganda</option>
              <option value="airtel_money">📱 Airtel Money Uganda</option>
            </select>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-2xs font-semibold">
            A unique transaction reference <strong>RTR-2026-XXXXXX</strong> will be generated for audit traceability.
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setPayoutModal(null)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold">Cancel</button>
            <button type="submit" disabled={processingPayout} className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold disabled:opacity-50">
              {processingPayout ? 'Processing...' : 'Disburse Mobile Money'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
