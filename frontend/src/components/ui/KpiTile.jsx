import React from "react";

const TONES = {
  navy:    { bg: "bg-[#082f49]",     text: "text-white",         icon: "text-sky-300",     hover: "hover:bg-[#0c4a6e]" },
  teal:    { bg: "bg-teal-600",      text: "text-white",         icon: "text-teal-200",    hover: "hover:bg-teal-700" },
  emerald: { bg: "bg-emerald-600",   text: "text-white",         icon: "text-emerald-200", hover: "hover:bg-emerald-700" },
  amber:   { bg: "bg-amber-500",     text: "text-white",         icon: "text-amber-100",   hover: "hover:bg-amber-600" },
  orange:  { bg: "bg-orange-500",    text: "text-white",         icon: "text-orange-100",  hover: "hover:bg-orange-600" },
  rose:    { bg: "bg-rose-500",      text: "text-white",         icon: "text-rose-100",    hover: "hover:bg-rose-600" },
  slate:   { bg: "bg-slate-700",     text: "text-white",         icon: "text-slate-300",   hover: "hover:bg-slate-800" },
  white:   { bg: "bg-white",         text: "text-slate-900",     icon: "text-slate-400",   hover: "hover:bg-slate-50" },
};

export default function KpiTile({ icon: Icon, value, label, tone = "white", onClick, pulse = false }) {
  const t = TONES[tone] || TONES.white;
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-4 flex flex-col gap-2 shadow-[0_1px_2px_rgba(15,23,42,0.06)]
        ${t.bg} ${t.text} ${onClick ? `${t.hover} cursor-pointer active:scale-[0.98] transition-all duration-150 hover:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.16)]` : ""}
        ${pulse ? "animate-soft-pulse" : ""}
      `}
      aria-label={label}
    >
      {/* Subtle background glow ring */}
      <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/10" />

      <Icon className={`w-5 h-5 ${t.icon} relative z-10`} aria-hidden="true" />
      <div className="relative z-10">
        <p className="text-xl sm:text-2xl font-extrabold leading-none tracking-tight">{value ?? "—"}</p>
        <p className={`text-[11px] font-semibold mt-1 ${tone === "white" ? "text-slate-500" : "opacity-80"}`}>{label}</p>
      </div>
    </Tag>
  );
}
