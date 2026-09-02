import React, { useState, useEffect } from 'react';
import { HeartHandshake, Plus, Filter, RefreshCw } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { useNotifications } from '../context/NotificationContext';

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ client_id: '', type: 'phone_call', description: '', action_taken: '', outcome: 'successful', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useNotifications();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (outcomeFilter) params.append('outcome', outcomeFilter);
      const [intvRes, clientRes] = await Promise.all([
        api.get(`/interventions?${params}`),
        api.get('/clients?limit=100')
      ]);
      if (intvRes.success) setInterventions(intvRes.data.interventions || intvRes.data);
      if (clientRes.success) setClients(clientRes.data.clients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [typeFilter, outcomeFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/interventions', form);
      if (res.success) {
        addToast('Intervention Logged', 'Caseworker care action saved successfully.', 'success');
        setShowModal(false);
        setForm({ client_id: '', type: 'phone_call', description: '', action_taken: '', outcome: 'successful', notes: '' });
        fetchAll();
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed to log intervention', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const outcomeBadge = { successful: 'bg-emerald-50 text-emerald-800 border-emerald-200', pending: 'bg-amber-50 text-amber-800 border-amber-200', escalated: 'bg-red-50 text-red-800 border-red-200', rescheduled: 'bg-sky-50 text-sky-800 border-sky-200' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Caseworker Care Log</h1>
          <p className="text-xs text-slate-500 mt-1">Documented interventions, support calls, and clinical actions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowModal(true)} className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Intervention
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap gap-3">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium">
          <option value="">All Types</option>
          <option value="phone_call">Phone Call</option>
          <option value="in_person">In-Person Visit</option>
          <option value="counseling">Counseling</option>
          <option value="family_support">Family Support</option>
          <option value="employment_support">Employment Support</option>
          <option value="referral">Medical Referral</option>
        </select>
        <select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium">
          <option value="">All Outcomes</option>
          <option value="successful">Successful</option>
          <option value="pending">Pending Follow-up</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      {loading ? <LoadingSkeleton type="table" count={5} /> : interventions.length === 0 ? (
        <EmptyState icon={HeartHandshake} title="No interventions logged" description="Record caseworker care actions using the New Intervention button above." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-3xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Caseworker</th>
                  <th className="py-3.5 px-4">Outcome</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {interventions.map(intv => (
                  <tr key={intv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{intv.client_name}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-2xs font-semibold capitalize">
                        {(intv.type || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 max-w-xs truncate">{intv.description}</td>
                    <td className="py-4 px-4 text-slate-600">{intv.caseworker_name}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-lg border text-2xs font-semibold capitalize ${outcomeBadge[intv.outcome] || outcomeBadge.pending}`}>
                        {intv.outcome}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-2xs">
                      {new Date(intv.performed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Intervention Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log New Caseworker Intervention">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Patient</label>
            <select required value={form.client_id} onChange={(e) => setForm(f => ({ ...f, client_id: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
              <option value="">— Select Client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
                <option value="phone_call">Phone Call</option>
                <option value="in_person">In-Person</option>
                <option value="counseling">Counseling</option>
                <option value="family_support">Family Support</option>
                <option value="employment_support">Employment Support</option>
                <option value="referral">Referral</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Outcome</label>
              <select value={form.outcome} onChange={(e) => setForm(f => ({ ...f, outcome: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
                <option value="successful">Successful</option>
                <option value="pending">Pending Follow-up</option>
                <option value="escalated">Escalated</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
            <input required type="text" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Action Taken</label>
            <textarea rows={3} required value={form.action_taken} onChange={(e) => setForm(f => ({ ...f, action_taken: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold disabled:opacity-50">
              {submitting ? 'Saving...' : 'Log Intervention'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
