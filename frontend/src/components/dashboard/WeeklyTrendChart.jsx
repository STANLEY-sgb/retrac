import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeeklyTrendChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { week: 'W1', completed: 11, missed: 1, struggling: 1 },
    { week: 'W2', completed: 10, missed: 2, struggling: 2 },
    { week: 'W3', completed: 12, missed: 0, struggling: 2 },
    { week: 'W4', completed: 9, missed: 2, struggling: 3 }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 h-full">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Check-ins</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 12, fontSize: 12, color: '#fff' }} />
            <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="struggling" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="missed" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
