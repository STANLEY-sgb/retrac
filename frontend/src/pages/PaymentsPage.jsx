import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import StatCard from '../components/common/StatCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useNotifications } from '../context/NotificationContext';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ client_id: '', amount: '', provider: 'demo', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useNotifications();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, clientRes] = await Promise.all([
        api.get('/payments'),
        api.get('/clients?limit=100')
      ]);
      if (payRes.success && payRes.data) {
        setPayments(payRes.data.payments || payRes.data);
        setStats(payRes.data.stats || {});
      }
      if (clientRes.success) setClients(clientRes.data.clients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDisburse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/payments/disburse', form);
      if (res.success) {
        addToast(
          '💸 Mobile Money Dispatched!',
          `Reference ${res.data.transaction_reference} — UGX ${Number(form.amount).toLocaleString()}`,
          'success'
        );
        setShowModal(false);
        setForm({ client_id: '', amount: '', provider: 'demo', notes: '' });
        fetchData();
      }
    } catch (err) {
      addToast('Error', err.message || 'Payment failed', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const providerBadge = { mtn_momo: 'MTN MoMo', airtel_money: 'Airtel Money', demo: 'DEMO' };
  const providerColor = { mtn_momo: 'bg-yellow-100 text-yellow-900 border-yellow-200', airtel_money: 'bg-red-100 text-red-900 border-red-200', demo: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Mobile Money Disbursements</h1>
          <p className="text-xs text-slate-500 mt-1">MTN MoMo & Airtel Money reintegration payouts — RTR-2026-XXXXXX references</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowModal(true)} className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Trigger Payout
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {loading ? <LoadingSkeleton type="stat" count={3} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Disbursed" value={`UGX ${Math.round((stats.totalDisbursed || 0) / 1000)}K`} subtitle="Across all payouts" icon={CreditCard} color="emerald" />
          <StatCard title="Successful Payments" value={stats.successful || 0} subtitle="Completed transactions" icon={CheckCircle2} color="teal" />
          <StatCard title="Pending / Processing" value={stats.pending || 0} subtitle="Awaiting confirmation" icon={Clock} color="amber" />
        </div>
      )}

      {/* Payments Table */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-3xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Transaction Reference</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Amount (UGX)</th>
                  <th className="py-3.5 px-4">Provider</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-teal-800 text-xs">{p.transaction_reference}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-900">{p.client_name || '—'}</td>
                    <td className="py-4 px-4 font-black text-slate-900">{Number(p.amount).toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-lg border text-2xs font-bold ${providerColor[p.provider] || providerColor.demo}`}>
                        {providerBadge[p.provider] || p.provider}
                      </span>
                    </td>
                    <td className="py-4 px-4"><StatusBadge status={p.status} size="sm" /></td>
                    <td className="py-4 px-4 text-slate-500 text-2xs font-mono">
                      {new Date(p.completed_at || p.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-slate-600 max-w-xs truncate">{p.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trigger Payout Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Trigger Mobile Money Payout">
        <form onSubmit={handleDisburse} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Client / Recipient</label>
            <select required value={form.client_id} onChange={(e) => setForm(f => ({ ...f, client_id: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
              <option value="">— Select Client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.phone_number})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Amount (UGX)</label>
              <input type="number" required value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="e.g. 50000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Provider</label>
              <select value={form.provider} onChange={(e) => setForm(f => ({ ...f, provider: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
                <option value="demo">🧪 Demo / Sandbox</option>
                <option value="mtn_momo">📱 MTN Mobile Money</option>
                <option value="airtel_money">📱 Airtel Money</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Notes / Reason</label>
            <input type="text" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. Weekly transport stipend for Jumia delivery work"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-2xs font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Reference code <strong>RTR-2026-XXXXXX</strong> will be auto-generated for audit logs
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold disabled:opacity-50">
              {submitting ? 'Processing...' : 'Disburse Mobile Money'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
