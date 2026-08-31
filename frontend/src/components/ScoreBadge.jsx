import { scoreColor } from '../utils/scoreColor';

export default function ScoreBadge({ score, isDark }) {
  const color = scoreColor(score);
  const styles = {
    emerald: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700',
    amber: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700',
    rose: isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-300 ${
      styles[color] || (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700')
    }`}>
      {score}%
    </span>
  );
}