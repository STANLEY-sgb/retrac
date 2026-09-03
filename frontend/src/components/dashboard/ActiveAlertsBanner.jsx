import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';
import { parseReasons } from '../../lib/visual';
import StatusBadge from '../common/StatusBadge';

export default function ActiveAlertsBanner({ alerts = [] }) {
  if (!alerts?.length) return null;
  const critical = alerts.filter((a) => String(a.risk_level || a.level).toUpperCase() === 'CRITICAL').length;
  const atRisk = alerts.length - critical;
  const first = alerts[0];
  const reasons = parseReasons(first.reasons);

  return (
    <div className="rounded-2xl bg-rose-600 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-soft-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm font-extrabold">
            {critical > 0 && <span>{critical} Critical</span>}
            {atRisk > 0 && <span className="text-orange-100">{atRisk} At Risk</span>}
          </div>
          <p className="text-xs text-rose-100 mt-0.5">
            {first.client_name} · {first.risk_score ?? first.score}/100
            {reasons[0] ? ` · ${reasons[0]}` : ''}
          </p>
        </div>
      </div>
      <Link to="/risk-alerts" className="px-4 py-2 rounded-xl bg-white text-rose-700 text-xs font-bold self-start sm:self-auto">
        Review
      </Link>
    </div>
  );
}
