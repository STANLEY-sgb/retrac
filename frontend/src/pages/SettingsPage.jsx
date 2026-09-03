import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';

export default function SettingsPage() {
  const { addToast } = useNotifications();
  const [settings, setSettings] = useState({
    sms_provider: 'demo',
    ai_provider: 'demo',
    payment_provider: 'demo',
    risk_weight_missed: 15,
    risk_weight_struggling: 25,
    risk_weight_consecutive: 20,
    risk_weight_nlp: 20,
    risk_weight_unresolved: 10,
    weekly_checkin_day: 'monday',
    weekly_checkin_hour: '8',
    demo_mode: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then(res => {
      if (res.success && res.data) {
        const rows = res.data.settings || [];
        const mapped = {};
        rows.forEach(r => {
          // Parse boolean/numbers if needed
          if (r.value === 'true') mapped[r.key] = true;
          else if (r.value === 'false') mapped[r.key] = false;
          else if (!isNaN(Number(r.value)) && r.key.startsWith('risk_weight')) mapped[r.key] = Number(r.value);
          else mapped[r.key] = r.value;
        });
        setSettings(prev => ({ ...prev, ...mapped }));
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/admin/settings', settings);
      if (res.success) {
        addToast('Settings Saved', 'System configuration has been updated successfully.', 'success');
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed to save settings', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const setField = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const SectionTitle = ({ label }) => (
    <h3 className="text-sm font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
      <Settings className="w-4 h-4 text-teal-600" />
      {label}
    </h3>
  );

  const ProviderRadio = ({ field, value, label, desc }) => (
    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${settings[field] === value ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
      <input
        type="radio"
        name={field}
        value={value}
        checked={settings[field] === value}
        onChange={() => setField(field, value)}
        className="text-blue-600"
      />
      <div>
        <p className="text-xs font-bold text-slate-900">{label}</p>
        <p className="text-2xs text-slate-500">{desc}</p>
      </div>
    </label>
  );

  if (loading) return <div className="text-center py-16 text-slate-400 text-xs">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Configure providers, risk weights, and automation schedule</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="space-y-6">
        {/* SMS Provider */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <SectionTitle label="SMS Provider" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <ProviderRadio field="sms_provider" value="demo" label="🧪 Demo Mode (Default)" desc="Logs SMS to console and database — no actual sending" />
            <ProviderRadio field="sms_provider" value="africas_talking" label="📡 Africa's Talking" desc="Live Uganda SMS delivery via Africa's Talking API" />
          </div>
          {settings.sms_provider === 'africas_talking' && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-2xs font-semibold">
              ⚠ Set AFRICAS_TALKING_API_KEY and AFRICAS_TALKING_SENDER_ID in your .env file to activate live SMS delivery.
            </div>
          )}
        </div>

        {/* AI Provider */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <SectionTitle label="AI Risk Analysis Provider" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <ProviderRadio field="ai_provider" value="demo" label="🧪 Offline NLP Fallback (Default)" desc="Rule-based keyword detection, no external API call" />
            <ProviderRadio field="ai_provider" value="openai" label="🤖 OpenAI GPT-4o-mini" desc="Enhanced sentiment via OpenAI with PII stripping" />
          </div>
          {settings.ai_provider === 'openai' && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-2xs font-semibold">
              ⚠ Set OPENAI_API_KEY in your .env file. All text is anonymised before transmission.
            </div>
          )}
        </div>

        {/* Payment Provider */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <SectionTitle label="Mobile Money Payment Provider" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <ProviderRadio field="payment_provider" value="demo" label="🧪 Demo Sandbox (Default)" desc="Instant mock payments with RTR-2026 references" />
            <ProviderRadio field="payment_provider" value="mtn_momo" label="📱 MTN Mobile Money" desc="Live MTN MoMo Collection API (Uganda)" />
            <ProviderRadio field="payment_provider" value="airtel_money" label="📱 Airtel Money" desc="Live Airtel Money API (Uganda)" />
          </div>
        </div>

        {/* Risk Score Weights */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <SectionTitle label="Clinical Risk Score Weights" />
          <p className="text-xs text-slate-500 mb-4">Adjust how heavily each signal contributes to the 0-100 risk score:</p>
          <div className="space-y-4">
            {[
              { key: 'risk_weight_missed', label: 'Missed Check-in (+pts)', max: 30 },
              { key: 'risk_weight_struggling', label: '"Struggling" Reply (+pts)', max: 40 },
              { key: 'risk_weight_consecutive', label: 'Consecutive Struggling (+pts)', max: 30 },
              { key: 'risk_weight_nlp', label: 'NLP Distress Detected (+pts)', max: 30 },
              { key: 'risk_weight_unresolved', label: 'Unresolved Active Alert (+pts)', max: 20 }
            ].map(({ key, label, max }) => (
              <div key={key} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className="font-black text-slate-900 text-sm">+{settings[key]} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={max}
                  value={settings[key]}
                  onChange={(e) => setField(key, parseInt(e.target.value, 10))}
                  className="w-full accent-teal-600"
                />
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-2xs text-slate-500">
            Total weighted risk score is capped at 100. Thresholds: 0-29 Stable | 30-49 Monitor | 50-74 At Risk | 75-100 Critical
          </div>
        </div>

        {/* SMS Scheduling */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <SectionTitle label="Automated Check-In Schedule" />
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Send Day</label>
              <select value={settings.weekly_checkin_day} onChange={(e) => setField('weekly_checkin_day', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
                {['monday','tuesday','wednesday','thursday','friday'].map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Send Hour (EAT)</label>
              <select value={settings.weekly_checkin_hour} onChange={(e) => setField('weekly_checkin_hour', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
                {['6','7','8','9','10','12','14'].map(h => (
                  <option key={h} value={h}>{h}:00 EAT</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
