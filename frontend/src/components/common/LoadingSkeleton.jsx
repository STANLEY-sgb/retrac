import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 3 }) {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-full" />
        {items.map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-8 bg-slate-300 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse space-y-3">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
