import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend = null, onClick = null }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-700 border-blue-100',
      iconBg: 'bg-blue-600 text-white'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-100',
      iconBg: 'bg-emerald-600 text-white'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-800 border-amber-100',
      iconBg: 'bg-amber-500 text-white'
    },
    orange: {
      bg: 'bg-orange-50 text-orange-800 border-orange-100',
      iconBg: 'bg-orange-500 text-white'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-800 border-rose-100',
      iconBg: 'bg-rose-600 text-white'
    },
    teal: {
      bg: 'bg-teal-50 text-teal-800 border-teal-100',
      iconBg: 'bg-teal-600 text-white'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl shadow-xs ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trend && (
            <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
