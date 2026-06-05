export function scoreColor(score: number): string {
  if (score >= 4) return '#059669';
  if (score >= 3) return '#4338CA';
  if (score >= 2) return '#D97706';
  return '#DC2626';
}

export function scoreTrail(score: number): string {
  if (score >= 4) return '#D1FAE5';
  if (score >= 3) return '#E0E7FF';
  if (score >= 2) return '#FEF3C7';
  return '#FEE2E2';
}
