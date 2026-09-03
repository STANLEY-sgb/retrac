import React from "react";
import { initials } from "../../lib/visual";

// Generate a consistent color from the name
function nameToColor(name = "") {
  const colors = [
    { bg: "bg-[#082f49] text-teal-300" },
    { bg: "bg-teal-700 text-white" },
    { bg: "bg-blue-700 text-white" },
    { bg: "bg-violet-700 text-white" },
    { bg: "bg-emerald-700 text-white" },
    { bg: "bg-amber-600 text-white" },
    { bg: "bg-rose-700 text-white" },
    { bg: "bg-sky-700 text-white" },
  ];
  if (!name) return colors[0].bg;
  const hash = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length].bg;
}

export default function Avatar({ name, size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-14 h-14 text-base",
    xl: "w-16 h-16 text-lg",
  };

  return (
    <div
      className={`${sizes[size] || sizes.md} ${nameToColor(name)} rounded-xl font-extrabold flex items-center justify-center flex-shrink-0 select-none`}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
