import React from "react";
import { Link } from "react-router-dom";
import { AlertOctagon, ChevronRight } from "lucide-react";
import { parseReasons } from "../../lib/visual";

export default function ActiveAlertsBanner({ alerts = [] }) {
  if (!alerts?.length) return null;
  const critical = alerts.filter((a) => String(a.risk_level || a.level).toUpperCase() === "CRITICAL").length;
  const atRisk = alerts.length - critical;
  const first = alerts[0];
  const reasons = parseReasons(first.reasons);

  return (
    <div className="rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_4px_16px_rgba(239,68,68,0.3)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 animate-soft-pulse">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm font-extrabold flex-wrap">
            {critical > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {critical} Critical
              </span>
            )}
            {atRisk > 0 && (
              <span className="text-orange-100">{atRisk} At Risk</span>
            )}
            <span className="text-rose-200 font-normal text-xs">{alerts.length} patient{alerts.length !== 1 ? "s" : ""} require attention</span>
          </div>
          <p className="text-xs text-rose-200 mt-0.5">
            <span className="font-semibold text-white">{first.client_name}</span>
            {" · "}{first.risk_score ?? first.score}/100
            {reasons[0] ? ` · ${reasons[0]}` : ""}
          </p>
        </div>
      </div>
      <Link
        to="/risk-alerts"
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-rose-700 text-xs font-bold self-start sm:self-auto hover:bg-rose-50 transition-colors shrink-0"
      >
        Review Alerts <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
