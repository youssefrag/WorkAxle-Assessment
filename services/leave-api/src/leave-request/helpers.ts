export function toYMD(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function calculateDays(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime(); // milliseconds
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1; // inclusive of both start & end
}
