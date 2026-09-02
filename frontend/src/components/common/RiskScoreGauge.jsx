import React from 'react';
import { AlertOctagon, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function RiskScoreGauge({ score = 0, level = 'STABLE', reasons = [], size = 'md' }) {
  const numScore = Math.min(100, Math.max(0, parseInt(score, 10) || 0));

  // Color selection based on clinical classification
  let color = '#10b981'; // Stable
  let trackColor = 'bg-emerald-500';
  let bgCard = 'bg-emerald-50/40 border-emerald-100';
  let textColor = 'text-emerald-700';

  if (level === 'CRITICAL' || numScore >= 75) {
    color = '#ef4444';
    trackColor = 'bg-rose-500';
    bgCard = 'bg-rose-50/50 border-rose-200';
    textColor = 'text-rose-700';
  } else if (level === 'AT_RISK' || numScore >= 50) {
    color = '#f97316';
    trackColor = 'bg-orange-500';
    bgCard = 'bg-orange-50/40 border-orange-200';
    textColor = 'text-orange-700';
  } else if (level === 'MONITOR' || numScore >= 30) {
    color = '#f59e0b';
    trackColor = 'bg-amber-500';
    bgCard = 'bg-amber-50/40 border-amber-200';
    textColor = 'text-amber-700';
  }

  const reasonsList = Array.isArray(reasons)
    ? reasons
    : typeof reasons === 'string'
    ? (() => {
        try {
          return JSON.parse(reasons);
        } catch (e) {
          return [reasons];
        }
      })()
    : [];

  return (
    <div className={`rounded-xl border p-5 ${bgCard} shadow-sm`}>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Early Risk Assessment</span>
          <Info className="w-4 h-4 text-slate-400" title="Computed via rule-based heuristics & SMS signal analysis" />
        </div>
        <StatusBadge status={level} size="md" />
      </div>

      {/* Progress Bar & Score */}
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-3xl font-extrabold tracking-tight ${textColor}`}>{numScore}</span>
          <span className="text-xs text-slate-500 font-medium">/ 100</span>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {numScore <= 29 ? 'Low Risk' : numScore <= 49 ? 'Moderate Risk' : numScore <= 74 ? 'High Risk' : 'Severe Risk'}
        </span>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden mb-4">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ease-out ${trackColor}`}
          style={{ width: `${Math.max(5, numScore)}%` }}
        />
      </div>

      {/* Explainable Reasons */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Clinical Explainability:</h4>
        {reasonsList.length > 0 ? (
          <ul className="space-y-1.5">
            {reasonsList.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-white/80 p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic bg-white/60 p-2 rounded-lg">
            No active risk flags. Patient demonstrates consistent check-in adherence.
          </p>
        )}
      </div>
    </div>
  );
}
