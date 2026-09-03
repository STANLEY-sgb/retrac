import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function RecoveryDistributionChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { name: 'Stable', value: 8, color: '#10b981' },
    { name: 'Monitor', value: 3, color: '#f59e0b' },
    { name: 'At Risk', value: 2, color: '#f97316' },
    { name: 'Critical', value: 1, color: '#ef4444' }
  ];
  const total = chartData.reduce((s, d) => s + (d.value || 0), 0) || 1;
  const top = [...chartData].sort((a, b) => b.value - a.value)[0];
  const pct = Math.round(((top?.value || 0) / total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 h-full">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Status</p>
      <div className="relative h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={52} outerRadius={74} paddingAngle={3} dataKey="value">
              {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900">{pct}%</span>
          <span className="text-[11px] font-semibold text-slate-500">{top?.name}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-[11px] text-slate-600">
            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            {d.name} {d.value}
          </div>
        ))}
      </div>
    </div>
  );
}
