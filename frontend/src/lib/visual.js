export function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '—';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function formatUgx(value) {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `UGX ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  return `UGX ${n.toLocaleString()}`;
}

export function parseReasons(reasons) {
  if (!reasons) return [];
  if (Array.isArray(reasons)) return reasons.filter(Boolean);
  if (typeof reasons === 'string') {
    try {
      const parsed = JSON.parse(reasons);
      return Array.isArray(parsed) ? parsed : [reasons];
    } catch {
      return [reasons];
    }
  }
  return [];
}

export function riskTone(level, score) {
  const n = Number(score);
  const lv = String(level || '').toUpperCase();
  if (lv === 'CRITICAL' || n >= 75) {
    return { key: 'critical', label: 'Critical', color: '#ef4444', bg: 'bg-rose-50', text: 'text-rose-700', bar: 'bg-rose-500', ring: 'stroke-rose-500' };
  }
  if (lv === 'AT_RISK' || lv === 'AT RISK' || n >= 50) {
    return { key: 'atRisk', label: 'At Risk', color: '#f97316', bg: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-500', ring: 'stroke-orange-500' };
  }
  if (lv === 'MONITOR' || n >= 30) {
    return { key: 'monitor', label: 'Monitor', color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500', ring: 'stroke-amber-500' };
  }
  return { key: 'stable', label: 'Stable', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500', ring: 'stroke-emerald-500' };
}

export function jobIconKey(title = '', category = '') {
  const t = `${title} ${category}`.toLowerCase();
  if (t.includes('clean')) return 'Sparkles';
  if (t.includes('store') || t.includes('inventory') || t.includes('retail')) return 'Store';
  if (t.includes('cook') || t.includes('food') || t.includes('cater')) return 'Utensils';
  if (t.includes('farm') || t.includes('agri')) return 'Wheat';
  if (t.includes('car') || t.includes('auto')) return 'Car';
  if (t.includes('construct') || t.includes('build')) return 'HardHat';
  if (t.includes('hair') || t.includes('barber')) return 'Scissors';
  if (t.includes('office') || t.includes('admin')) return 'Laptop';
  return 'Briefcase';
}
