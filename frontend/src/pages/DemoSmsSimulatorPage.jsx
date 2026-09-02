import React, { useState, useEffect } from 'react';
import { Smartphone, Send, RefreshCw, MessageSquare, AlertTriangle, AlertOctagon, CheckCircle2, TrendingUp } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import RiskScoreGauge from '../components/common/RiskScoreGauge';
import { useNotifications } from '../context/NotificationContext';

const QUICK_REPLIES = [
  { label: '1 — Doing well', value: '1', desc: 'Stable positive response', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
  { label: '2 — Struggling', value: '2', desc: 'Distress trigger (+25 risk pts)', color: 'bg-rose-50 border-rose-300 text-rose-900' },
  { label: 'Custom free-text', value: 'custom', desc: 'e.g. "Having cravings today, need help"', color: 'bg-sky-50 border-sky-300 text-sky-900' }
];

export default function DemoSmsSimulatorPage() {
  const { addToast } = useNotifications();
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedReply, setSelectedReply] = useState('1');
  const [customText, setCustomText] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    api.get('/clients?limit=100').then(res => {
      if (res.success) setClients(res.data.clients || []);
    });
  }, []);

  const handleClientChange = (clientId) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId) || null;
    setSelectedClient(client);
    setResult(null);
    if (client) {
      setConversation([{
        dir: 'outbound',
        text: `Hi ${client.full_name.split(' ')[0]} 👋 How are you doing this week?\n\nReply:\n1 — I'm doing well\n2 — I'm struggling`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleSend = async () => {
    const messageText = selectedReply === 'custom' ? customText.trim() : selectedReply;
    if (!selectedClientId || !messageText) return;

    setSending(true);

    // Add client reply visually to phone mockup
    const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConversation(prev => [...prev, { dir: 'inbound', text: messageText, time: replyTime }]);

    try {
      // Send {clientId, message} as the backend demo controller expects
      const res = await api.post('/demo/sms', {
        clientId: selectedClientId,
        message: messageText
      });

      if (res.success && res.data) {
        const pipeline = res.data.pipelineResult || {};
        const riskUpdate = pipeline.riskUpdate || {};
        const aiAnalysis = pipeline.aiAnalysis || {};

        const riskScore = riskUpdate.newScore ?? 0;
        const riskLevel = riskUpdate.newLevel ?? 'STABLE';
        const reasons   = riskUpdate.reasons ?? [];

        // Show automated SMS reply in phone mockup
        const ackMsg = messageText === '1'
          ? `ReTrac: Wonderful to hear, ${selectedClient.full_name.split(' ')[0]}! Keep taking it one day at a time. We are proud of your progress. Have a blessed week!`
          : messageText === '2'
          ? `ReTrac: Thank you for sharing honestly, ${selectedClient.full_name.split(' ')[0]}. Your recovery team is here for you. A caseworker will be in touch shortly.`
          : `ReTrac: Thank you for your message. It has been logged with your caseworker. Stay strong!`;

        setConversation(prev => [...prev, {
          dir: 'outbound',
          text: ackMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        setResult({ riskScore, riskLevel, aiAnalysis: { ...aiAnalysis, reasons } });

        // Update client risk indicators locally for immediate UI feedback
        setSelectedClient(prev => prev
          ? { ...prev, current_risk_score: riskScore, current_risk_level: riskLevel }
          : prev
        );

        addToast(
          'SMS Pipeline Executed',
          `${selectedClient.full_name}: Risk updated to ${riskScore}/100 (${riskLevel})`,
          riskLevel === 'CRITICAL' || riskLevel === 'AT_RISK' ? 'danger' : 'success'
        );
      }
    } catch (err) {
      addToast('Pipeline Error', err.message || 'SMS processing failed', 'danger');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Smartphone className="w-7 h-7 text-teal-600" />
          Live SMS Simulator
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Simulate a client's 2G feature phone SMS check-in response and watch the entire backend pipeline execute in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls Panel */}
        <div className="space-y-4">
          {/* Step 1: Select Client */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-black">1</span>
              Select Patient
            </h3>
            <select
              value={selectedClientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">— Choose a registered client —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.full_name} | {c.current_risk_level} ({c.current_risk_score}/100)
                </option>
              ))}
            </select>

            {selectedClient && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-400 text-2xs">Phone</p>
                  <p className="font-mono font-bold text-slate-800">{selectedClient.phone_number}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-400 text-2xs">Current Risk</p>
                  <StatusBadge status={selectedClient.current_risk_level} size="sm" />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Select SMS Reply */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-600 text-white text-xs flex items-center justify-center font-black">2</span>
              Choose SMS Response
            </h3>
            <div className="space-y-2">
              {QUICK_REPLIES.map(r => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedReply === r.value ? r.color + ' shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                >
                  <input
                    type="radio"
                    name="reply"
                    value={r.value}
                    checked={selectedReply === r.value}
                    onChange={() => setSelectedReply(r.value)}
                    className="text-teal-600"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold">{r.label}</p>
                    <p className="text-2xs opacity-70">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {selectedReply === 'custom' && (
              <textarea
                rows={2}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder='e.g. "Having cravings today, feel like giving up, need help"'
                className="w-full mt-3 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            )}
          </div>

          {/* Step 3: Send */}
          <button
            onClick={handleSend}
            disabled={!selectedClientId || sending}
            className="w-full py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            <Send className="w-5 h-5" />
            {sending ? 'Processing through backend pipeline...' : 'Send SMS & Run Full Pipeline'}
          </button>

          {/* Result Panel */}
          {result && (
            <div className={`p-4 rounded-2xl border text-xs ${result.riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-200' : result.riskLevel === 'AT_RISK' ? 'bg-orange-50 border-orange-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className="font-black text-sm mb-2 flex items-center gap-2">
                {result.riskLevel === 'CRITICAL' && <AlertOctagon className="w-5 h-5 text-red-600" />}
                {result.riskLevel === 'AT_RISK' && <AlertTriangle className="w-5 h-5 text-orange-600" />}
                {(result.riskLevel === 'MONITOR' || result.riskLevel === 'STABLE') && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                Risk Score Updated: {result.riskScore}/100 — {result.riskLevel}
              </p>
              {result.aiAnalysis?.reasons && (
                <ul className="space-y-1 list-disc list-inside text-2xs opacity-80">
                  {result.aiAnalysis.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Right: Phone Mockup Preview */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex-1">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-800 text-teal-400 text-xs flex items-center justify-center font-black">📱</span>
              Feature Phone Preview — Uganda Telecom
            </h3>

            {/* Phone shell */}
            <div className="max-w-xs mx-auto">
              <div className="bg-slate-900 rounded-3xl p-4 shadow-2xl">
                <div className="bg-slate-800 rounded-2xl p-3 min-h-72 overflow-y-auto space-y-3">
                  {conversation.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-500 text-xs">Select a patient to preview check-in</p>
                    </div>
                  ) : (
                    conversation.map((msg, idx) => (
                      <div key={idx} className={`${msg.dir === 'outbound' ? 'mr-auto' : 'ml-auto'}`}>
                        <div className={`rounded-xl p-2.5 text-xs max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                          msg.dir === 'outbound'
                            ? 'bg-slate-700 text-slate-200'
                            : 'bg-blue-600 text-white ml-auto'
                        }`}>
                          {msg.dir === 'outbound' && (
                            <p className="text-teal-400 font-bold text-2xs mb-1">ReTrac System:</p>
                          )}
                          {msg.text}
                        </div>
                        <p className={`text-3xs text-slate-500 mt-0.5 ${msg.dir === 'inbound' ? 'text-right' : ''}`}>
                          {msg.time} · {msg.dir === 'outbound' ? 'ReTrac' : 'Client'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 italic">Type message...</div>
                  <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Show Risk Gauge after result */}
          {selectedClient && result && (
            <RiskScoreGauge
              score={result.riskScore}
              level={result.riskLevel}
              reasons={result.aiAnalysis?.reasons || []}
            />
          )}
        </div>
      </div>
    </div>
  );
}
