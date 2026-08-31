export default function SkillTag({ skill, type, isDark }) {
  const styles = {
    matched: isDark 
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
      : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    missing: isDark 
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
      : 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-all duration-300 hover:scale-105 ${styles[type]}`}>
      {skill}
    </span>
  );
}