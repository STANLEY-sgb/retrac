import React from 'react';
import { Check } from 'lucide-react';

export default function VisualPipeline({ stages = [], activeIndex = -1, completed = [] }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {stages.map((st, idx) => {
        const done = completed.includes(st.id) || (activeIndex >= 0 && idx < activeIndex);
        const current = !done && (completed.length === idx || activeIndex === idx);
        const Icon = st.icon;
        return (
          <React.Fragment key={st.id}>
            <div className={`flex flex-col items-center min-w-[64px] px-1 transition-all ${done ? 'opacity-100' : current ? 'opacity-100' : 'opacity-40'}`}>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                  done
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : current
                    ? 'bg-teal-50 border-teal-500 text-teal-700 animate-pulse'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : Icon ? <Icon className="w-4 h-4" /> : idx + 1}
              </div>
              <span className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 text-center leading-tight">
                {st.label}
              </span>
            </div>
            {idx < stages.length - 1 && (
              <div className={`h-px flex-1 min-w-[12px] mb-5 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
