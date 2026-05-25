const SUFFIXES = [
  { v: 1e15, s: 'Q' },
  { v: 1e12, s: 'T' },
  { v: 1e9, s: 'B' },
  { v: 1e6, s: 'M' },
  { v: 1e3, s: 'K' },
];

export function fmt(n) {
  if (!isFinite(n) || n === null || n === undefined) return '0';
  const abs = Math.abs(n);
  for (const { v, s } of SUFFIXES) {
    if (abs >= v) {
      const val = n / v;
      return val >= 100 ? `${Math.floor(val)}${s}` : val >= 10 ? `${val.toFixed(1)}${s}` : `${val.toFixed(2)}${s}`;
    }
  }
  return abs >= 1 ? n.toFixed(0) : n.toFixed(2);
}

export function fmtMoney(n) {
  return `$${fmt(n)}`;
}

export function fmtTime(seconds) {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
