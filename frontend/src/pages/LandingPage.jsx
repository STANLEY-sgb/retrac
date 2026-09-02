import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Briefcase,
  CreditCard,
  HeartHandshake,
  Smartphone,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  Users,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="ReTrac Logo" className="w-10 h-10" />
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                Re<span className="text-teal-400">Trac</span>
              </span>
              <span className="block text-3xs uppercase tracking-widest text-slate-400 font-semibold">
                DOMINION 2026 • Track 05
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/demo/sms"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-300 bg-teal-950/60 hover:bg-teal-900/80 border border-teal-500/30 rounded-xl transition-all"
            >
              <Smartphone className="w-4 h-4" /> Live SMS Simulator
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              Portal Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/40 via-slate-900 to-slate-900 -z-10" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> DOMINION 2026 — Rehabilitation & Reintegration Track
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Stay Connected.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-sky-400 to-blue-400">
              Stay Recovered.
            </span><br />
            Rebuild Your Life.
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
            A simple aftercare and reintegration platform that keeps people connected after addiction treatment in Uganda — through the phones they already use.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/demo/sms"
              className="px-8 py-4 rounded-xl text-base font-bold text-slate-900 bg-teal-400 hover:bg-teal-300 shadow-xl shadow-teal-500/20 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Smartphone className="w-5 h-5" /> Explore Live Demo
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl text-base font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-xl transition-all hover:scale-105 flex items-center gap-2"
            >
              Caseworker Login <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/employers"
              className="px-6 py-4 rounded-xl text-base font-semibold text-slate-300 hover:text-white bg-transparent hover:bg-slate-800/40 border border-slate-800 transition-all"
            >
              Employer Portal
            </Link>
          </div>

          <div className="mt-12 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Built for basic 2G feature phones (SMS/USSD) &bull; No smartphone app or mobile data required</span>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">The Real-World Challenge</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">Why Relapse Happens After Discharge</h3>
            <p className="text-slate-400 mt-4 text-sm sm:text-base leading-relaxed">
              In Uganda, over 65% of individuals leaving rehabilitation centres face isolation, severe stigma, lack of income, and zero structured aftercare within the first 90 days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Post-Discharge Disconnection</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once patients leave clinical centres like Butabika, caseworkers lose contact. Early distress triggers go unnoticed until a full relapse occurs.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">The Digital Divide</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Most existing e-health apps assume continuous 4G data and smartphones. ReTrac builds for the phone people actually own: basic 2G feature phones.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Unemployment & Economic Vulnerability</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Without financial dignity, recovery rarely lasts. ReTrac connects clients to vetted work and delivers instant Mobile Money disbursements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How ReTrac Works (The Complete Loop) */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">End-to-End Architecture</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">How ReTrac Works</h3>
            <p className="text-slate-400 mt-4 text-sm sm:text-base">
              A continuous, human-in-the-loop bridge between patient, caseworker, employer, and mobile financial services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-2xl font-black text-teal-400 mb-4">01</div>
              <h4 className="text-base font-bold text-white mb-2">Weekly SMS Check-In</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated 2-way SMS check-ins sent every Monday. Clients reply "1" (doing well), "2" (struggling), or free-text.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-2xl font-black text-sky-400 mb-4">02</div>
              <h4 className="text-base font-bold text-white mb-2">Early Risk Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rule-based heuristics + privacy-first NLP analyze missed check-ins, responses, and sentiment to compute an explainable risk score (0-100).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-2xl font-black text-amber-400 mb-4">03</div>
              <h4 className="text-base font-bold text-white mb-2">Caseworker Triage</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-risk alerts instantly notify caseworkers. Interventions, counseling calls, and family support are logged on the client timeline.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-2xl font-black text-emerald-400 mb-4">04</div>
              <h4 className="text-base font-bold text-white mb-2">Jobs & Mobile Money</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recovered clients match to local jobs. Upon verified work completion, stipends disburse via MTN MoMo and Airtel Money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-slate-950/80 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Phone Preview Mockup */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                <Smartphone className="w-5 h-5 text-teal-400" />
                <span className="text-xs font-bold text-slate-300">Feature Phone Check-In (Uganda Telecom / MTN)</span>
              </div>
              <div className="space-y-4 font-mono text-xs">
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-slate-200">
                  <p className="font-bold text-teal-400 mb-1">ReTrac:</p>
                  <p>Hi John 👋 How are you doing this week?</p>
                  <p className="mt-2 text-slate-400">Reply:<br />1 — I'm doing well<br />2 — I'm struggling</p>
                </div>

                <div className="bg-blue-600 text-white p-3 rounded-xl ml-auto max-w-[70%] text-right font-bold">
                  2 - Having a hard time with cravings at home
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-slate-200">
                  <p className="font-bold text-teal-400 mb-1">ReTrac:</p>
                  <p>Thank you for sharing honestly, John. Your recovery team is here for you. Caseworker Sulait will call you shortly. Stay strong.</p>
                </div>
              </div>
            </div>

            {/* Right: Caseworker Dashboard Preview Details */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Triage Intelligence</span>
              <h3 className="text-3xl font-black text-white mt-2 mb-6">Explainable AI & Rule-Based Early Warning</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Unlike opaque black-box AI, ReTrac never replaces clinicians and never provides medical diagnoses. It gives caseworkers actionable, explainable signals:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Rule-Based Weighted Scoring</h5>
                    <p className="text-2xs text-slate-400 mt-0.5">Missed check-ins (+15), struggling response (+25), consecutive stress (+20).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Privacy-Preserving NLP Sentiment</h5>
                    <p className="text-2xs text-slate-400 mt-0.5">Flags emotional distress keywords while completely stripping patient PII.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Instant Interventions & Resolution</h5>
                    <p className="text-2xs text-slate-400 mt-0.5">Follow-ups directly reduce risk scores and restore patient to monitor/stable status.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">
            Experience the Complete ReTrac Story
          </h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-8">
            Test the live SMS simulator, watch risk scores update in real time, record caseworker follow-ups, match jobs, and trigger Mobile Money disbursements.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all"
            >
              Launch Caseworker Portal
            </Link>
            <Link
              to="/demo/sms"
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-sm rounded-xl border border-slate-700 transition-all"
            >
              Open SMS Simulator
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>&copy; 2026 ReTrac Healthcare & Reintegration Uganda. DOMINION 2026 MVP.</p>
            <p className="text-3xs text-slate-400">
              Prototype for evaluation purposes. Clinical & privacy safeguarding review required prior to patient trials.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
