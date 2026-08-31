export function scoreColor(score) {
  if (score >= 70) return 'emerald';
  if (score >= 40) return 'amber';
  return 'rose';
}