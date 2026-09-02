import React from 'react';
import { FlaskConical, MessageSquare, CreditCard, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-inner border-b border-sky-800/40">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-400/30">
          <FlaskConical className="w-3 h-3" /> DOMINION 2026 DEMO
        </span>
        <span className="text-slate-200 hidden sm:inline">
          ReTrac MVP — Uganda Recovery Aftercare & Reintegration Platform
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/demo/sms"
          className="inline-flex items-center gap-1 text-sky-300 hover:text-white font-medium underline underline-offset-2 transition-colors"
        >
          <MessageSquare className="w-3 h-3" /> SMS Simulator
        </Link>
        <span className="text-slate-600">|</span>
        <Link
          to="/demo/payment"
          className="inline-flex items-center gap-1 text-teal-300 hover:text-white font-medium underline underline-offset-2 transition-colors"
        >
          <CreditCard className="w-3 h-3" /> MoMo Simulator
        </Link>
      </div>
    </div>
  );
}
