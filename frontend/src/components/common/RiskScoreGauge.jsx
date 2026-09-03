import React from 'react';
import RiskRing from '../ui/RiskRing';

export default function RiskScoreGauge({ score = 0, level = 'STABLE', reasons = [], size = 'md' }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      <RiskRing score={score} level={level} reasons={reasons} compact={size === 'sm'} />
    </div>
  );
}
