import React from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone, Brain, Bell, HeartHandshake, Briefcase, Wallet, Activity,
  ArrowRight, CheckCircle2, ShieldAlert
} from 'lucide-react';
import RiskRing from '../components/ui/RiskRing';

const FLOW = [
  { icon: Smartphone, label: 'SMS' },
  { icon: Brain, label: 'Risk' },
  { icon: Bell, label: 'Alert' },
  { icon: HeartHandshake, label: 'Support' },
  { icon: Briefcase, label: 'Job' },
  { icon: Wallet, label: 'Pay' },
  { icon: Activity, label: 'Recovery' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07111a] text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07111a]/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-8 h-8" />
            <span className="text-xl font-extrabold tracking-tight">Re<span className="text-teal-400">Trac</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400">
              Enter Portal
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-16 pb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-teal-400 mb-4">ReTrac</p>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08]">
          Stay Connected.<br />Stay Recovered.<br />Rebuild Your Life.
        </h1>
        <p className="mt-4 text-slate-400 max-w-md mx-auto text-sm">Aftercare on the phones people already own.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="px-6 py-3 rounded-xl bg-teal-400 text-slate-950 font-bold text-sm hover:bg-teal-300">
            Explore Demo
          </Link>
          <Link to="/login" className="px-6 py-3 rounded-xl border border-white/15 font-bold text-sm hover:bg-white/5">
            Enter Portal
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between gap-1 overflow-x-auto">
          {FLOW.map((s, i) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center min-w-[72px]">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-teal-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</span>
                </div>
                {i < FLOW.length - 1 && <div className="h-px flex-1 min-w-4 bg-white/10 mb-6" />}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mx-auto w-[240px] rounded-[2rem] border-4 border-slate-700 bg-slate-950 p-3">
              <div className="rounded-xl bg-[#07170b] text-[#7bf28d] font-mono text-[11px] p-3 h-56 flex flex-col">
                <div className="flex justify-between text-[9px] opacity-80 mb-3">
                  <span>MTN UG</span><span>10:00 AM</span><span>94%</span>
                </div>
                <p className="font-bold text-[10px] mb-2">ReTrac Aftercare</p>
                <p>How is your recovery this week?</p>
                <div className="mt-auto flex gap-2">
                  <span className="flex-1 text-center py-1.5 rounded bg-[#143d1a] border border-[#277038] font-bold">1</span>
                  <span className="flex-1 text-center py-1.5 rounded bg-[#143d1a] border border-[#277038] font-bold">2</span>
                </div>
              </div>
            </div>
            <p className="text-center mt-4 text-sm font-semibold text-slate-300">2 — I’m struggling</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                <Brain className="w-4 h-4" /> Risk Engine
              </div>
              <RiskRing score={67} level="AT_RISK" compact />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <div>
                <p className="text-xs font-bold">Caseworker Alert</p>
                <p className="text-[11px] text-slate-400">John Okello · 67 / 100</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
              <span className="flex items-center gap-2 text-sm font-semibold"><Briefcase className="w-4 h-4 text-sky-300" /> Store Assistant</span>
              <span className="text-lg font-extrabold text-teal-300">82%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="flex items-center gap-2 text-sm font-semibold"><Wallet className="w-4 h-4 text-emerald-300" /> Paid</span>
              <span className="text-lg font-extrabold text-emerald-300">UGX 20,000</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-[11px] text-slate-500">
        ReTrac · Uganda aftercare
      </footer>
    </div>
  );
}
