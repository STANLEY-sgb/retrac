import React from 'react';
import { FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DemoBanner() {
  return (
    <div className="bg-[#082f49] text-white text-[11px] px-4 py-1.5 flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1.5 font-semibold text-teal-200">
        <FlaskConical className="w-3 h-3" /> Demo
      </span>
      <div className="flex items-center gap-3 font-medium">
        <Link to="/demo/sms" className="text-slate-300 hover:text-white">SMS</Link>
        <Link to="/demo/payment" className="text-slate-300 hover:text-white">MoMo</Link>
      </div>
    </div>
  );
}
