import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function WeeklyTrendChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { week: 'Week 1', completed: 11, missed: 1, struggling: 1 },
    { week: 'Week 2', completed: 10, missed: 2, struggling: 2 },
    { week: 'Week 3', completed: 12, missed: 0, struggling: 2 },
    { week: 'Week 4', completed: 9, missed: 2, struggling: 3 }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Weekly Check-In Completion</h4>
          <p className="text-xs text-slate-500">SMS response compliance and early distress trends</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-slate-600 font-medium capitalize">{value}</span>}
            />
            <Bar dataKey="completed" name="Completed (Stable)" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="struggling" name="Replied Struggling (2)" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="missed" name="Missed Response" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
