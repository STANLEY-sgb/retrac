import React from "react";

export default function EmptyState({ icon: Icon, title = "Nothing here yet", description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        {Icon && <Icon className="w-6 h-6 text-slate-400" />}
      </div>
      <p className="text-sm font-bold text-slate-700">{title}</p>
      {description && <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl bg-[#082f49] text-white text-xs font-bold hover:bg-[#0c4a6e] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
