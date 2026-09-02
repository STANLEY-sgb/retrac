import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useNotifications();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-slate-900 text-white';
        let Icon = Info;

        if (toast.type === 'success') {
          bg = 'bg-emerald-700 text-white';
          Icon = CheckCircle2;
        } else if (toast.type === 'danger') {
          bg = 'bg-rose-700 text-white';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-600 text-white';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border border-white/20 transition-all duration-300 animate-slide-up ${bg}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-bold leading-snug">{toast.title}</h5>
              <p className="text-xs text-white/90 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white p-1 -mr-1 -mt-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
