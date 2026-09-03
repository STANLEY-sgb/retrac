import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Smartphone, Brain, Bell, HeartHandshake, Briefcase, Wallet, Activity,
  ArrowRight, CheckCircle2, ShieldAlert, Users, MessageSquare, ChevronRight,
  Zap, Globe, Shield
} from "lucide-react";
import RiskRing from "../components/ui/RiskRing";

const FLOW = [
  { icon: Smartphone, label: "2G SMS", desc: "Works on any phone" },
  { icon: Brain,      label: "AI Risk", desc: "Score in seconds" },
  { icon: Bell,       label: "Alert",   desc: "Instant notification" },
  { icon: HeartHandshake, label: "Support", desc: "Caseworker action" },
  { icon: Briefcase,  label: "Job",     desc: "Matched placement" },
  { icon: Wallet,     label: "MoMo",    desc: "Direct payment" },
  { icon: Activity,   label: "Recovery", desc: "Sustained outcomes" },
];

const STATS = [
  { value: "800+",  label: "Clients Monitored" },
  { value: "2G",    label: "Works on Any Phone" },
  { value: "94%",   label: "Check-in Rate" },
  { value: "UGX 12M+", label: "Wages Disbursed" },
];

const FEATURES = [
  {
    icon: Smartphone,
    color: "text-teal-400",
    bg: "bg-teal-400/10 border-teal-400/20",
    title: "2G SMS Aftercare",
    desc: "Recovery check-ins over basic SMS — no smartphone, no internet required. Reaches patients wherever they are across Uganda.",
    items: ["Works on Nokia & Itel feature phones", "Africa's Talking SMS gateway", "Automated weekly check-in dispatch"],
  },
  {
    icon: Brain,
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    title: "AI Risk Engine",
    desc: "Parses SMS replies to compute a dynamic 0–100 relapse risk score, flagging high-risk patients for immediate caseworker intervention.",
    items: ["Keyword sentiment analysis", "Real-time score update", "CRITICAL alert escalation"],
  },
  {
    icon: Wallet,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    title: "Inclusive Employment",
    desc: "Skills-matched job placements with MTN & Airtel Mobile Money stipend disbursement — directly to the patient's phone.",
    items: ["Employer partner portal", "Skill-based matching algorithm", "MoMo wage disbursement"],
  },
];

const ROLES = [
  { icon: HeartHandshake, label: "Caseworker",  desc: "Monitor patients, log interventions, send check-ins", color: "text-teal-400", bg: "bg-teal-900/30 border-teal-500/30" },
  { icon: Shield,          label: "Admin",       desc: "Oversee all caseloads, manage staff, audit system", color: "text-blue-400",  bg: "bg-blue-900/30 border-blue-500/30" },
  { icon: Briefcase,       label: "Employer",    desc: "Post vacancies, review matched candidates, disburse wages", color: "text-amber-400", bg: "bg-amber-900/30 border-amber-500/30" },
];

export default function LandingPage() {
  const [activeFlow, setActiveFlow] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveFlow(p => (p + 1) % FLOW.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#07111a] text-slate-100 overflow-x-hidden">

      {/* ── Sticky Navigation ──────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07111a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="w-8 h-8" />
            <span className="text-xl font-extrabold tracking-tight">
              Re<span className="text-teal-400">Trac</span>
            </span>
            <span className="hidden sm:inline ml-2 px-2 py-0.5 rounded-md bg-teal-900/50 text-teal-300 text-[10px] font-bold border border-teal-700/40 uppercase tracking-wider">
              DOMINION 2026
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-slate-500">Track 05 — Rehabilitation & Reintegration</span>
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors flex items-center gap-1.5"
            >
              Enter Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-700/40 bg-teal-900/30 text-teal-300 text-xs font-bold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          Live Demo Available — DOMINION 2026 · Track 05
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06]">
          Stay Connected.<br />
          Stay Recovered.<br />
          <span className="text-teal-400">Rebuild Your Life.</span>
        </h1>
        <p className="mt-6 text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          ReTrac is Uganda's post-rehabilitation aftercare platform — delivering 2G SMS check-ins, AI-powered risk scoring, 
          job matching, and Mobile Money payments to recovering patients, wherever they are.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            className="px-6 py-3.5 rounded-xl bg-teal-400 text-slate-950 font-bold text-sm hover:bg-teal-300 transition-colors flex items-center gap-2"
          >
            Explore Live Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3.5 rounded-xl border border-white/15 font-bold text-sm hover:bg-white/5 transition-colors"
          >
            Enter Portal
          </Link>
        </div>
      </section>

      {/* ── Impact Stats ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-300">{s.value}</p>
              <p className="mt-1 text-xs text-slate-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Animated Pipeline Flow ─────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">
          The ReTrac Aftercare Pipeline
        </p>
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {FLOW.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === activeFlow;
            return (
              <React.Fragment key={s.label}>
                <div
                  className={`flex flex-col items-center min-w-[64px] sm:min-w-[80px] transition-all duration-500 ${isActive ? "scale-110" : "scale-100 opacity-50"}`}
                >
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
                    isActive ? "bg-teal-400/20 border-teal-400/60 text-teal-300" : "bg-white/5 border-white/10 text-slate-500"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? "text-teal-300" : "text-slate-500"}`}>
                    {s.label}
                  </span>
                  <span className="text-[9px] text-slate-600 mt-0.5 hidden sm:block">{s.desc}</span>
                </div>
                {i < FLOW.length - 1 && (
                  <div className={`h-px flex-1 min-w-3 transition-all duration-300 mb-6 ${i < activeFlow ? "bg-teal-400/60" : "bg-white/8"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* ── Feature Cards ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">
          Platform Capabilities
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={`rounded-3xl border p-6 ${f.bg} bg-white/[0.02]`}>
                <div className={`w-10 h-10 rounded-2xl ${f.bg} border flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-bold text-sm text-slate-100 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{f.desc}</p>
                <ul className="space-y-1.5">
                  {f.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${f.color} shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Live Preview Split ─────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">
          See It In Action
        </p>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Phone Mockup */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 flex flex-col items-center gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">2G SMS Check-in</p>
            <div className="w-[200px] rounded-[1.8rem] border-4 border-slate-700 bg-slate-950 p-2.5">
              <div className="rounded-xl bg-[#07170b] text-[#7bf28d] font-mono text-[11px] p-3 h-52 flex flex-col">
                <div className="flex justify-between text-[9px] opacity-70 mb-3 border-b border-[#184824] pb-1.5">
                  <span>MTN UG 2G</span><span>10:00 AM</span><span>94%</span>
                </div>
                <p className="font-bold text-[10px] mb-2 text-[#4ade80]">ReTrac Aftercare</p>
                <p className="text-[10.5px] leading-relaxed">How is your recovery this week?</p>
                <p className="text-[10px] mt-2 opacity-80">1 — Doing well</p>
                <p className="text-[10px] opacity-80">2 — I'm struggling</p>
                <div className="mt-auto">
                  <div className="ml-8 bg-[#143d1a] border border-[#277038] rounded px-2 py-1 text-right text-[10px]">
                    <span className="text-[8px] text-[#4ade80] block">SMS Reply:</span>
                    <span className="font-bold">"2"</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400">Patient replies <span className="text-teal-400 font-bold">"2"</span> — system scores, alerts, acts.</p>
          </div>

          {/* Risk Engine Panel */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Risk Engine Response</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <Brain className="w-4 h-4 text-purple-400" /> AI Risk Score
              </div>
              <RiskRing score={67} level="AT_RISK" compact />
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-200">Caseworker Alert Triggered</p>
                <p className="text-[11px] text-slate-400 mt-0.5">John Okello · Score 67 / 100 · AT_RISK</p>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Briefcase className="w-4 h-4 text-sky-400" /> Store Assistant
              </span>
              <span className="text-lg font-extrabold text-teal-300">82% match</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Wallet className="w-4 h-4 text-emerald-400" /> MoMo Stipend
              </span>
              <span className="text-lg font-extrabold text-emerald-300">UGX 20,000</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Wage delivered to MTN +256 77X XXX XXX
            </div>
          </div>
        </div>
      </section>

      {/* ── Role-Based Access ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">
          Three Portals, One Platform
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.label} className={`rounded-2xl border p-5 ${r.bg}`}>
                <Icon className={`w-6 h-6 ${r.color} mb-3`} />
                <p className="font-bold text-sm text-slate-200 mb-1">{r.label}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-teal-400 text-slate-950 font-bold text-sm hover:bg-teal-300 transition-colors"
          >
            Try the Live Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-3 text-xs text-slate-600">No setup required — click any demo role card to explore instantly</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-6 h-6 opacity-60" />
            <span className="text-sm font-bold opacity-60">ReTrac</span>
          </div>
          <p className="text-xs text-slate-600 text-center">
            Stay Connected. Stay Recovered. Rebuild Your Life.
          </p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-md bg-teal-900/40 text-teal-400 text-[10px] font-bold border border-teal-700/30">
              DOMINION 2026
            </span>
            <span className="text-xs text-slate-600">Track 05</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
