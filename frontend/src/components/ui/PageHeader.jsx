import React from 'react';

export default function PageHeader({ title, actions }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
      {actions ? <div className="flex items-center gap-2 flex-shrink-0">{actions}</div> : null}
    </div>
  );
}
