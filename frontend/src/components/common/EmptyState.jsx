import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here', description, actionLabel, onAction }) {
  return (
    <div className="text-center py-14 px-4 rounded-2xl bg-white border border-slate-200/80">
      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {description ? <p className="text-xs text-slate-500 mt-1">{description}</p> : null}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
