import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Activity, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  if (!status) return null;

  const clean = String(status).toUpperCase();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }[size] || 'text-xs px-2.5 py-1';

  let config = {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Activity,
    label: status
  };

  switch (clean) {
    case 'STABLE':
      config = {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: ShieldCheck,
        label: 'Stable (Low Risk)'
      };
      break;
    case 'MONITOR':
      config = {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertTriangle,
        label: 'Monitor'
      };
      break;
    case 'AT_RISK':
    case 'AT RISK':
      config = {
        bg: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: AlertTriangle,
        label: 'At Risk'
      };
      break;
    case 'CRITICAL':
      config = {
        bg: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
        icon: AlertOctagon,
        label: 'Critical Alert'
      };
      break;
    case 'ACTIVE':
    case 'OPEN':
      config = {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Activity,
        label: clean === 'ACTIVE' ? 'Active' : 'Open Vacancy'
      };
      break;
    case 'COMPLETED':
    case 'SUCCESSFUL':
    case 'RESOLVED':
    case 'ACCEPTED':
      config = {
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        icon: CheckCircle,
        label: clean.charAt(0) + clean.slice(1).toLowerCase()
      };
      break;
    case 'PENDING':
    case 'SENT':
    case 'MATCHED':
    case 'APPLIED':
      config = {
        bg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: Clock,
        label: clean.charAt(0) + clean.slice(1).toLowerCase()
      };
      break;
    case 'MISSED':
    case 'FAILED':
    case 'REJECTED':
    case 'LOST_CONTACT':
      config = {
        bg: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
        label: clean.replace('_', ' ')
      };
      break;
  }

  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-sm ${config.bg} ${sizeClasses}`}>
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
