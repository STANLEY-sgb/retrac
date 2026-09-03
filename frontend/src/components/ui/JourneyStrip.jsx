import React from 'react';
import { Check } from 'lucide-react';

export default function JourneyStrip({ steps = [], current = 0 }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-1">
      {steps.map((st, idx) => {
        const done = idx < current;
        const active = idx === current;
        const Icon = st.icon;
        return (
          <React.Fragment key={st.label}>
            <div className="flex flex-col items-center min-w-[72px]">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                  done
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : active
                    ? 'bg-[#082f49] border-[#082f49] text-teal-300'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : Icon ? <Icon className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`mt-1.5 text-[10px] font-semibold text-center ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                {st.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-px w-6 sm:w-10 mb-5 ${done ? 'bg-teal-500' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
