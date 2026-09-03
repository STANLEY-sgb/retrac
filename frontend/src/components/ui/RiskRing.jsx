import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { parseReasons, riskTone } from '../../lib/visual';

export default function RiskRing({ score = 0, level = 'STABLE', delta = null, reasons = [], compact = false }) {
  const num = Math.min(100, Math.max(0, parseInt(score, 10) || 0));
  const tone = riskTone(level, num);
  const list = parseReasons(reasons).slice(0, 3);
  const r = compact ? 36 : 52;
  const c = 2 * Math.PI * r;
  const offset = c - (num / 100) * c;
  const size = compact ? 96 : 136;

  const Trend = delta == null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={tone.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-extrabold leading-none ${compact ? 'text-xl' : 'text-3xl'} ${tone.text}`}>{num}</span>
          <span className="text-[10px] font-semibold text-slate-400">/100</span>
        </div>
      </div>
      <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${tone.bg} ${tone.text}`}>
        {tone.label}
        {delta != null && (
          <span className="inline-flex items-center gap-0.5">
            <Trend className="w-3 h-3" />
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </div>
      {list.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {list.map((r, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium max-w-[160px] truncate">
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
