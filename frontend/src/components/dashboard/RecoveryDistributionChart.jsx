import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function RecoveryDistributionChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { name: 'Stable (0-29)', value: 8, color: '#10b981' },
    { name: 'Monitor (30-49)', value: 3, color: '#f59e0b' },
    { name: 'At Risk (50-74)', value: 2, color: '#f97316' },
    { name: 'Critical (75-100)', value: 1, color: '#ef4444' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Recovery Status Distribution</h4>
          <p className="text-xs text-slate-500">Active patient clinical categorization</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} Patients`, name]}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
