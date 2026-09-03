import React from 'react';

export default function KpiTile({ icon: Icon, value, label, tone = 'slate', onClick }) {
  const tones = {
    slate: 'text-slate-900',
    teal: 'text-teal-700',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    orange: 'text-orange-700',
    rose: 'text-rose-700',
    navy: 'text-[#082f49]'
  };
  const iconWrap = {
    slate: 'bg-slate-100 text-slate-600',
    teal: 'bg-teal-50 text-teal-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    orange: 'bg-orange-50 text-orange-700',
    rose: 'bg-rose-50 text-rose-700',
    navy: 'bg-[#082f49] text-teal-300'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-md hover:border-slate-300 transition-all ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${iconWrap[tone] || iconWrap.slate}`}>
        {Icon ? <Icon className="w-4.5 h-4.5 w-5 h-5" /> : null}
      </div>
      <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${tones[tone] || tones.slate}`}>
        {value}
      </p>
      <p className="text-[11px] font-semibold text-slate-500 mt-1.5 uppercase tracking-wide">{label}</p>
    </button>
  );
}
