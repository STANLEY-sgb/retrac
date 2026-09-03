import React from 'react';
import { initials } from '../../lib/visual';

export default function Avatar({ name, size = 'md', tone = 'navy' }) {
  const sizes = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-base',
    xl: 'w-16 h-16 text-lg'
  };
  const tones = {
    navy: 'bg-[#082f49] text-teal-300',
    teal: 'bg-teal-600 text-white',
    rose: 'bg-rose-600 text-white',
    amber: 'bg-amber-500 text-white'
  };
  return (
    <div className={`${sizes[size] || sizes.md} ${tones[tone] || tones.navy} rounded-full font-bold flex items-center justify-center flex-shrink-0`}>
      {initials(name)}
    </div>
  );
}
