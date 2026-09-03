import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Send, CheckCircle2, RefreshCw, Wallet, Check } from 'lucide-react';
import api from '../api/client';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import KpiTile from '../components/ui/KpiTile';
import VisualPipeline from '../components/ui/VisualPipeline';
import Avatar from '../components/ui/Avatar';
import { useNotifications } from '../context/NotificationContext';
import { Shield, Radio, Building2 } from 'lucide-react';
import { formatUgx } from '../lib/visual';

const PAY_STEPS = [
  { id: 1, label: 'Authorize', icon: Shield },
  { id: 2, label: 'Processing', icon: Radio },
  { id: 3, label: 'Telecom', icon: Building2 },
  { id: 4, label: 'Success', icon: CheckCircle2 },
];

export default function DemoPaymentSimulatorPage() {
  const { addToast } = useNotifications();
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [network, setNetwork] = useState('mtn_momo');
  const [amount, setAmount] = useState('20000');
  const [notes, setNotes] = useState('Reintegration stipend');
  const [authorizingStep, setAuthorizingStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loadingLedger, setLoadingLedger] = useState(true);

  const fetchLedger = async () => {
    setLoadingLedger(true);
    try {
      const res = await api.get('/payments?limit=25');
      if (res.success && res.data) {
        setPayments(res.data.payments || []);
        setStats(res.data.statistics || res.data.stats || {});
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    api.get('/clients?limit=100').then((res) => {
      if (res.success && res.data.clients) {
        const list = res.data.clients;
        setClients(list);
        const queryParams = new URLSearchParams(location.search);
        const preselectedId = location.state?.clientId || queryParams.get('clientId');
        const match = preselectedId ? list.find((c) => c.id === preselectedId) : list[0];
        if (match) {
          setSelectedClientId(match.id);
          setSelectedClient(match);
          autoDetectNetwork(match.phone_number);
        }
      }
    });
    fetchLedger();
  }, [location]);

  const autoDetectNetwork = (phone = '') => {
    const clean = phone.replace('+256', '0');
    setNetwork(clean.startsWith('070') || clean.startsWith('075') ? 'airtel_money' : 'mtn_momo');
  };

  const handleClientChange = (clientId) => {
    const client = clients.find((c) => c.id === clientId) || null;
    setSelectedClientId(clientId);
    setSelectedClient(client);
    setTxResult(null);
    setAuthorizingStep(0);
    if (client) autoDetectNetwork(client.phone_number);
  };

  const handleProcessPayment = async () => {
    if (!selectedClientId || !amount || processing) return;
    setProcessing(true);
    setTxResult(null);
    setAuthorizingStep(1);
    try {
      setTimeout(() => setAuthorizingStep(2), 500);
      setTimeout(() => setAuthorizingStep(3), 900);
      const res = await api.post('/payments/disburse', {
        clientId: selectedClientId,
        amount: parseFloat(amount),
        provider: network,
        network,
        notes
      });
      if (res.success && res.data) {
        setTimeout(() => {
          setAuthorizingStep(4);
          setTxResult(res.data);
          setProcessing(false);
          addToast('Paid', `${res.data.reference} · ${formatUgx(amount)}`, 'success');
          fetchLedger();
        }, 1200);
      } else {
        throw new Error(res.message || 'Failed');
      }
    } catch (err) {
      setProcessing(false);
      setAuthorizingStep(0);
      addToast('Error', err.message || 'Failed', 'danger');
    }
  };

  const completed = authorizingStep > 0 ? PAY_STEPS.filter((s) => s.id <= authorizingStep).map((s) => s.id) : [];
  const okCount = stats.successfulCount || payments.filter((p) => p.status === 'successful' || p.status === 'completed').length || 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-xl font-extrabold">Mobile Money</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile icon={Wallet} value={formatUgx(stats.totalAmountPaid || stats.totalDisbursed || 0)} label="Paid" tone="emerald" />
        <KpiTile icon={CheckCircle2} value={okCount} label="Successful" tone="teal" />
        <KpiTile icon={RefreshCw} value={stats.pendingCount || stats.pending || 0} label="Pending" tone="amber" />
        <KpiTile icon={Wallet} value={stats.totalCount || payments.length || 0} label="Txns" tone="navy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={selectedClient?.full_name} />
            <select value={selectedClientId} onChange={(e) => handleClientChange(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-sm font-semibold">
              {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <p className="text-xs font-mono text-slate-500">{selectedClient?.phone_number}</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setNetwork('mtn_momo')} className={`p-3 rounded-xl border text-xs font-bold ${network === 'mtn_momo' ? 'bg-amber-50 border-amber-400' : 'border-slate-200'}`}>MTN</button>
            <button type="button" onClick={() => setNetwork('airtel_money')} className={`p-3 rounded-xl border text-xs font-bold ${network === 'airtel_money' ? 'bg-rose-50 border-rose-400' : 'border-slate-200'}`}>Airtel</button>
          </div>
          <div className="text-center py-4">
            <p className="text-[11px] font-bold text-slate-400">UGX</p>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full text-center text-4xl font-extrabold bg-transparent outline-none" />
            <div className="flex gap-2 mt-3">
              {['20000', '50000', '65000'].map((p) => (
                <button key={p} type="button" onClick={() => setAmount(p)} className={`flex-1 py-1 rounded-lg text-[11px] font-bold border ${amount === p ? 'bg-[#082f49] text-white' : 'border-slate-200'}`}>
                  {Number(p) / 1000}K
                </button>
              ))}
            </div>
          </div>
          <VisualPipeline stages={PAY_STEPS} completed={completed} />
          <button type="button" onClick={handleProcessPayment} disabled={!selectedClientId || !amount || processing}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            <Send className="w-4 h-4" /> {processing ? 'Processing…' : 'Authorize'}
          </button>
          {txResult && (
            <div className="rounded-2xl bg-emerald-50 p-4 text-center animate-scale-up">
              <p className="text-2xl font-extrabold text-emerald-700">+ {formatUgx(amount)}</p>
              <p className="text-xs font-mono mt-1">{txResult.reference}</p>
              <div className="mt-3 mx-auto w-40 rounded-xl bg-[#07170b] text-[#7bf28d] font-mono text-[10px] p-3">
                <p>💰 Received</p>
                <p className="font-bold">{formatUgx(amount)}</p>
                <p>{txResult.reference}</p>
              </div>
              <Link to="/demo/sms" className="inline-block mt-3 text-xs font-bold text-teal-800">Open phone</Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase text-slate-400">Ledger</p>
            <button onClick={fetchLedger} className="p-2 rounded-lg hover:bg-slate-50"><RefreshCw className="w-4 h-4" /></button>
          </div>
          {loadingLedger ? <LoadingSkeleton type="card" count={4} /> : payments.length === 0 ? (
            <EmptyState icon={Wallet} title="No transactions" />
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto custom-scrollbar">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={p.client_name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{p.client_name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{p.transaction_reference}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-emerald-600">+ {formatUgx(p.amount)}</p>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700"><Check className="w-3 h-3" /> Done</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
