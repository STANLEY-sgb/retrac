import React from 'react';
import { AlertOctagon, PhoneCall, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

export default function ActiveAlertsBanner({ alerts = [], onResolveAlert }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-orange-600 rounded-2xl p-5 text-white shadow-lg mb-6 animate-soft-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs flex-shrink-0">
            <AlertOctagon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-md">
                Critical Care Attention Required
              </span>
              <span className="text-xs text-rose-100 font-medium">
                {alerts.length} patient{alerts.length > 1 ? 's' : ''} flagged for immediate triage
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-extrabold mt-1">
              {alerts[0].client_name} (Risk Score: {alerts[0].risk_score}/100)
            </h4>
            <p className="text-xs text-rose-100 max-w-2xl mt-0.5">
              {typeof alerts[0].reasons === 'string' ? JSON.parse(alerts[0].reasons).slice(0, 2).join(' • ') : alerts[0].reasons.slice(0, 2).join(' • ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <Link
            to={`/clients/${alerts[0].client_id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            View Client <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/risk-alerts"
            className="inline-flex items-center gap-1 px-3 py-2 bg-rose-800/60 hover:bg-rose-800 text-white rounded-xl text-xs font-medium backdrop-blur-xs transition-colors"
          >
            All Alerts ({alerts.length})
          </Link>
        </div>
      </div>
    </div>
  );
}
