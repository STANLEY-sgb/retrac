import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

const TOAST_CONFIG = {
  success: { icon: CheckCircle2, bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", iconCls: "text-emerald-500" },
  danger:  { icon: XCircle,      bg: "bg-rose-50 border-rose-200",       text: "text-rose-800",    iconCls: "text-rose-500" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50 border-amber-200",    text: "text-amber-800",   iconCls: "text-amber-500" },
  info:    { icon: Info,          bg: "bg-sky-50 border-sky-200",         text: "text-sky-800",     iconCls: "text-sky-500" },
};

function Toast({ toast, onDismiss }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = config.icon;

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-2xl border shadow-[0_4px_16px_rgba(15,23,42,0.12)] max-w-sm w-full animate-slide-in-left ${config.bg}`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconCls}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold ${config.text}`}>{toast.title}</p>
        {toast.message && (
          <p className={`text-[11px] mt-0.5 ${config.text} opacity-75 truncate`}>{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`${config.text} opacity-40 hover:opacity-100 transition-opacity shrink-0`}
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useNotifications();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <div className="flex flex-col gap-2 items-end pointer-events-auto">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  );
}
