import React, { useState, useEffect } from 'react';
import {
  Send, RefreshCw, MessageSquare, Briefcase, ShieldCheck, AlertTriangle,
  Inbox, User, Check, Brain, Bell, Smartphone
} from 'lucide-react';
import api from '../api/client';
import FeaturePhoneSimulator from '../components/demo/FeaturePhoneSimulator';
import StatusBadge from '../components/common/StatusBadge';
import RiskRing from '../components/ui/RiskRing';
import VisualPipeline from '../components/ui/VisualPipeline';
import { useNotifications } from '../context/NotificationContext';

const SCENARIOS = [
  { id: 'opt1', title: 'Stable', sub: 'Reply 1', text: '1', icon: ShieldCheck, tone: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  { id: 'opt2', title: 'Struggling', sub: 'Reply 2', text: '2', icon: AlertTriangle, tone: 'border-rose-200 bg-rose-50 text-rose-800' },
  { id: 'high_risk', title: 'Free Text', sub: 'Distress', text: 'I had severe shakes and cravings last night. Need help.', icon: MessageSquare, tone: 'border-orange-200 bg-orange-50 text-orange-800' },
  { id: 'job_query', title: 'Jobs', sub: 'JOB', text: 'JOB', icon: Briefcase, tone: 'border-sky-200 bg-sky-50 text-sky-800' },
];

const PIPELINE = [
  { id: 1, label: 'Sent', icon: Send },
  { id: 2, label: 'Received', icon: Inbox },
  { id: 3, label: 'Client', icon: User },
  { id: 4, label: 'Check-in', icon: Check },
  { id: 5, label: 'Risk', icon: Brain },
  { id: 6, label: 'Alert', icon: Bell },
  { id: 7, label: 'Notify', icon: Smartphone },
];

export default function DemoSmsSimulatorPage() {
  const { addToast } = useNotifications();
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [currentInput, setCurrentInput] = useState('1');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [dispatchingPrompt, setDispatchingPrompt] = useState(false);
  const [result, setResult] = useState(null);
  const [completedStages, setCompletedStages] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);

  useEffect(() => {
    api.get('/clients?limit=100').then((res) => {
      if (res.success && res.data.clients) {
        const list = res.data.clients;
        setClients(list);
        if (list.length > 0 && !selectedClientId) handleSelectClient(list[0].id, list);
      }
    }).catch(console.error);
  }, []);

  const loadClientHistory = async (clientId) => {
    try {
      const res = await api.get(`/demo/sms/history/${clientId}`);
      if (res.success && res.data) {
        setMessages(res.data.messages || []);
        if (res.data.client) setSelectedClient((prev) => ({ ...prev, ...res.data.client }));
      }
    } catch (err) {
      console.warn(err.message);
    }
  };

  const handleSelectClient = (id, clientList = clients) => {
    setSelectedClientId(id);
    setSelectedClient(clientList.find((c) => c.id === id) || null);
    setResult(null);
    setCompletedStages([]);
    if (id) loadClientHistory(id);
  };

  const triggerPipelineAnimation = () => {
    setCompletedStages([]);
    PIPELINE.forEach((stage, idx) => {
      setTimeout(() => setCompletedStages((prev) => [...prev, stage.id]), 280 * (idx + 1));
    });
  };

  const addLog = (text) => {
    setEventLogs((prev) => [{ id: Math.random(), time: new Date().toLocaleTimeString(), text }, ...prev.slice(0, 8)]);
  };

  const handleSendCheckinPrompt = async () => {
    if (!selectedClientId) return;
    setDispatchingPrompt(true);
    try {
      const res = await api.post(`/checkins/send/${selectedClientId}`);
      if (res.success) {
        addToast('Sent', 'Check-in dispatched', 'success');
        addLog('Check-in sent');
        await loadClientHistory(selectedClientId);
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed', 'danger');
    } finally {
      setDispatchingPrompt(false);
    }
  };

  const handleResetConversation = async () => {
    if (!selectedClientId) return;
    try {
      const res = await api.post(`/demo/sms/reset/${selectedClientId}`);
      if (res.success) {
        setMessages([]);
        setResult(null);
        setCompletedStages([]);
        addToast('Reset', 'Chat cleared', 'info');
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed', 'danger');
    }
  };

  const handleTransmit = async () => {
    const msgText = (currentInput || '').trim();
    if (!selectedClientId || !msgText || sending) return;
    setSending(true);
    setCompletedStages([]);
    addLog(`SMS “${msgText}”`);
    try {
      const res = await api.post('/demo/sms', { clientId: selectedClientId, message: msgText });
      if (res.success && res.data) {
        const pipeline = res.data.pipelineResult || {};
        const riskUpdate = pipeline.riskUpdate || {};
        const riskScore = riskUpdate.newScore ?? selectedClient?.current_risk_score;
        const riskLevel = riskUpdate.newLevel ?? selectedClient?.current_risk_level;
        setResult({ riskScore, riskLevel, reasons: riskUpdate.reasons ?? [] });
        setSelectedClient((prev) => prev ? { ...prev, current_risk_score: riskScore, current_risk_level: riskLevel } : prev);
        triggerPipelineAnimation();
        setTimeout(() => loadClientHistory(selectedClientId), 600);
        addToast('Pipeline', `${riskScore}/100`, riskLevel === 'CRITICAL' || riskLevel === 'AT_RISK' ? 'danger' : 'success');
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed', 'danger');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">SMS</h1>
        <div className="flex gap-2">
          <button onClick={() => loadClientHistory(selectedClientId)} className="p-2.5 rounded-xl bg-white border border-slate-200"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={handleSendCheckinPrompt} disabled={dispatchingPrompt} className="px-3 py-2.5 rounded-xl bg-[#082f49] text-white text-xs font-bold disabled:opacity-50">
            {dispatchingPrompt ? '…' : 'Send check-in'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 flex flex-col items-center">
          <FeaturePhoneSimulator
            client={selectedClient}
            network={selectedClient?.phone_number?.includes('70') || selectedClient?.phone_number?.includes('75') ? 'Airtel' : 'MTN'}
            messages={messages}
            currentInput={currentInput}
            onInputChange={setCurrentInput}
            onSend={handleTransmit}
            sending={sending}
            onReset={handleResetConversation}
          />
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase text-slate-400">Client</span>
              {selectedClient && <StatusBadge status={selectedClient.current_risk_level} size="sm" />}
            </div>
            <select value={selectedClientId} onChange={(e) => handleSelectClient(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold">
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name} · {c.phone_number}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SCENARIOS.map((sc) => {
              const Icon = sc.icon;
              const on = currentInput === sc.text;
              return (
                <button key={sc.id} type="button" onClick={() => setCurrentInput(sc.text)}
                  className={`p-3 rounded-2xl border text-left ${on ? 'ring-2 ring-teal-500 ' : ''}${sc.tone}`}>
                  <Icon className="w-5 h-5 mb-2" />
                  <p className="text-xs font-extrabold">{sc.title}</p>
                  <p className="text-[10px] opacity-80">{sc.sub}</p>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
            <textarea rows={2} value={currentInput} onChange={(e) => setCurrentInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            <button type="button" onClick={handleTransmit} disabled={!selectedClientId || !currentInput || sending}
              className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              <Send className="w-4 h-4" /> {sending ? 'Sending…' : 'Send'}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
            <VisualPipeline stages={PIPELINE} completed={completedStages} />
            {result && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <RiskRing score={result.riskScore} level={result.riskLevel} reasons={result.reasons} compact />
              </div>
            )}
          </div>

          <div className="bg-[#082f49] rounded-2xl p-3 font-mono text-[11px] text-teal-200 max-h-32 overflow-y-auto custom-scrollbar">
            {eventLogs.length === 0 ? <p className="text-slate-500">Ready</p> : eventLogs.map((log) => (
              <div key={log.id} className="flex gap-2"><span className="text-slate-500">{log.time}</span><span>{log.text}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
