import React from "react";

const BADGE_MAP = {
  // Risk levels
  CRITICAL:  { label: "Critical",  cls: "bg-rose-100 text-rose-700 border-rose-200" },
  AT_RISK:   { label: "At Risk",   cls: "bg-orange-100 text-orange-700 border-orange-200" },
  MONITOR:   { label: "Monitor",   cls: "bg-amber-100 text-amber-700 border-amber-200" },
  STABLE:    { label: "Stable",    cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  // Client statuses
  active:          { label: "Active",        cls: "bg-teal-100 text-teal-700 border-teal-200" },
  completed:       { label: "Graduated",     cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  lost_contact:    { label: "Lost Contact",  cls: "bg-slate-100 text-slate-600 border-slate-200" },
  // Job statuses
  open:            { label: "Open",          cls: "bg-sky-100 text-sky-700 border-sky-200" },
  filled:          { label: "Filled",        cls: "bg-teal-100 text-teal-700 border-teal-200" },
  closed:          { label: "Closed",        cls: "bg-slate-100 text-slate-600 border-slate-200" },
  // Application statuses
  pending:         { label: "Pending",       cls: "bg-amber-100 text-amber-700 border-amber-200" },
  accepted:        { label: "Accepted",      cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected:        { label: "Rejected",      cls: "bg-rose-100 text-rose-700 border-rose-200" },
  interviewed:     { label: "Interviewed",   cls: "bg-purple-100 text-purple-700 border-purple-200" },
  // Payment statuses
  successful:      { label: "Paid",          cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  failed:          { label: "Failed",        cls: "bg-rose-100 text-rose-700 border-rose-200" },
  processing:      { label: "Processing",    cls: "bg-amber-100 text-amber-700 border-amber-200" },
  // Intervention
  in_progress:     { label: "In Progress",   cls: "bg-sky-100 text-sky-700 border-sky-200" },
  successful_intv: { label: "Resolved",      cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  unsuccessful:    { label: "Unsuccessful",  cls: "bg-rose-100 text-rose-700 border-rose-200" },
};

export default function StatusBadge({ status, size = "md" }) {
  const key = String(status || "").toUpperCase() in BADGE_MAP
    ? String(status).toUpperCase()
    : String(status || "").toLowerCase() in BADGE_MAP
    ? String(status).toLowerCase()
    : null;

  const config = key ? BADGE_MAP[key] : { label: status || "Unknown", cls: "bg-slate-100 text-slate-500 border-slate-200" };

  const sizeClass = size === "sm"
    ? "px-1.5 py-0.5 text-[10px] rounded-md"
    : "px-2 py-0.5 text-[11px] rounded-lg";

  return (
    <span className={`inline-flex items-center font-bold border ${config.cls} ${sizeClass} whitespace-nowrap`}>
      {config.label}
    </span>
  );
}
