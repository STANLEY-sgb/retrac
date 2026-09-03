import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Activity, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  if (!status) return null;
  const clean = String(status).toUpperCase();
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-1',
    lg: 'text-xs px-3 py-1.5'
  }[size] || 'text-[11px] px-2.5 py-1';

  let config = { bg: 'bg-slate-100 text-slate-700', icon: Activity, label: String(status) };

  switch (clean) {
    case 'STABLE':
      config = { bg: 'bg-emerald-50 text-emerald-700', icon: ShieldCheck, label: 'Stable' };
      break;
    case 'MONITOR':
      config = { bg: 'bg-amber-50 text-amber-700', icon: AlertTriangle, label: 'Monitor' };
      break;
    case 'AT_RISK':
    case 'AT RISK':
      config = { bg: 'bg-orange-50 text-orange-700', icon: AlertTriangle, label: 'At Risk' };
      break;
    case 'CRITICAL':
      config = { bg: 'bg-rose-50 text-rose-700', icon: AlertOctagon, label: 'Critical' };
      break;
    case 'ACTIVE':
    case 'OPEN':
      config = { bg: 'bg-sky-50 text-sky-700', icon: Activity, label: clean === 'ACTIVE' ? 'Active' : 'Open' };
      break;
    case 'COMPLETED':
    case 'SUCCESSFUL':
    case 'RESOLVED':
    case 'ACCEPTED':
      config = { bg: 'bg-teal-50 text-teal-700', icon: CheckCircle, label: clean.charAt(0) + clean.slice(1).toLowerCase() };
      break;
    case 'PENDING':
    case 'SENT':
    case 'MATCHED':
    case 'APPLIED':
    case 'RECEIVED':
      config = { bg: 'bg-amber-50 text-amber-800', icon: Clock, label: clean.charAt(0) + clean.slice(1).toLowerCase() };
      break;
    case 'MISSED':
    case 'FAILED':
    case 'REJECTED':
    case 'LOST_CONTACT':
      config = { bg: 'bg-rose-50 text-rose-700', icon: XCircle, label: clean.replace('_', ' ') };
      break;
    default:
      break;
  }

  const IconComponent = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full ${config.bg} ${sizeClasses}`}>
      <IconComponent className="w-3 h-3 flex-shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
