import React, { useState, useEffect } from 'react';
import { CreditCard, Send, CheckCircle2, Smartphone, Zap } from 'lucide-react';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';

export default function DemoPaymentSimulatorPage() {
  const { addToast } = useNotifications();
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [provider, setProvider] = useState('demo');
  const [amount, setAmount] = useState('50000');
  const [notes, setNotes] = useState('Weekly reintegration stipend');
  const [processing, setProcessing] = useState(false);
  const [txResult, setTxResult] = useState(null);

  useEffect(() => {
    api.get('/clients?limit=100').then(res => {
      if (res.success) setClients(res.data.clients || []);
    });
  }, []);

  const handleClientChange = (clientId) => {
    setSelectedClientId(clientId);
    setSelectedClient(clients.find(c => c.id === clientId) || null);
    setTxResult(null);
  };

  const handleProcess = async () => {
    if (!selectedClientId || !amount) return;
    setProcessing(true);
    setTxResult(null);
    try {
      const res = await api.post('/payments/disburse', {
        client_id: selectedClientId,
        amount: parseFloat(amount),
        provider,
        notes
      });
      if (res.success) {
        setTxResult(res.data);
        addToast(
          '💸 Payment Dispatched!',
          `${res.data.transaction_reference} — UGX ${Number(amount).toLocaleString()} to ${selectedClient.full_name}`,
          'success'
        );
      }
    } catch (err) {
      addToast('Error', err.message || 'Payment failed', 'danger');
    } finally {
      setProcessing(false);
    }
  };

  const providerDetails = {
    demo: { name: '🧪 Demo Sandbox', desc: 'Instant simulated payment — no real money transferred', color: 'bg-slate-100 text-slate-900 border-slate-300' },
    mtn_momo: { name: '📱 MTN Mobile Money', desc: 'Uganda MTN MoMo — requires API credentials', color: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
    airtel_money: { name: '📱 Airtel Money', desc: 'Uganda Airtel Money — requires API credentials', color: 'bg-red-100 text-red-900 border-red-300' }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-teal-600" />
          Mobile Money Simulator
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Simulate MTN MoMo or Airtel Money disbursements with auto-generated RTR-2026-XXXXXX references
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        {/* Step 1: Client */}
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-black">1</span>
            Select Recipient
          </h3>
          <select value={selectedClientId} onChange={(e) => handleClientChange(e.target.value)}
            className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">— Choose client to pay —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.phone_number}</option>)}
          </select>
        </div>

        {/* Step 2: Payment Details */}
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-teal-600 text-white text-xs flex items-center justify-center font-black">2</span>
            Payment Details
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Amount (UGX)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Reference Notes</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
        </div>

        {/* Step 3: Provider */}
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs flex items-center justify-center font-black">3</span>
            Mobile Money Provider
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.entries(providerDetails).map(([key, detail]) => (
              <label key={key}
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${provider === key ? detail.color + ' shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                <input type="radio" name="provider" value={key} checked={provider === key} onChange={() => setProvider(key)} className="text-teal-600" />
                <div>
                  <p className="text-xs font-bold">{detail.name}</p>
                  <p className="text-2xs opacity-70">{detail.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleProcess}
          disabled={!selectedClientId || !amount || processing}
          className="w-full py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
        >
          <Zap className="w-5 h-5" />
          {processing ? 'Processing Mobile Money Transfer...' : `Send UGX ${Number(amount || 0).toLocaleString()} via ${providerDetails[provider].name}`}
        </button>
      </div>

      {/* Transaction Result */}
      {txResult && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-base font-black text-emerald-900">Payment Dispatched Successfully!</p>
              <p className="text-emerald-700 font-semibold">Mobile money transfer initiated to {selectedClient?.full_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <p className="text-2xs text-emerald-600 font-bold uppercase tracking-wider">Transaction Reference</p>
              <p className="font-mono font-black text-emerald-900 text-lg mt-1">{txResult.transaction_reference}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <p className="text-2xs text-emerald-600 font-bold uppercase tracking-wider">Amount Disbursed</p>
              <p className="font-black text-emerald-900 text-lg mt-1">UGX {Number(txResult.amount).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <p className="text-2xs text-emerald-600 font-bold uppercase tracking-wider">Provider</p>
              <p className="font-bold text-emerald-900 mt-1">{providerDetails[txResult.provider || provider]?.name}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <p className="text-2xs text-emerald-600 font-bold uppercase tracking-wider">Status</p>
              <p className="font-bold text-emerald-900 mt-1 capitalize">{txResult.status}</p>
            </div>
          </div>

          <p className="text-2xs text-emerald-600 text-center font-semibold">
            This transaction is immutably recorded in the ReTrac audit log for financial compliance.
          </p>
        </div>
      )}
    </div>
  );
}
