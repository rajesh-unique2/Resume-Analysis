import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { scoreColor } from '../utils/scoreColor';

/**
 * Horizontal, scrollable pill navigation between analyzed jobs. Each pill
 * shows a status dot (score-colored, or rose for a failed job) so you can
 * see at a glance which jobs are worth checking without clicking through.
 */
export default function JobTabs({ jobs, activeIndex, onSelect, isDark }) {
  const scrollRef = useRef(null);

  const scrollBy = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  const dotClass = (job) => {
    if (job.error) return isDark ? 'bg-rose-400' : 'bg-rose-500';
    const tone = scoreColor(job.score);
    const map = {
      emerald: isDark ? 'bg-emerald-400' : 'bg-emerald-500',
      amber: isDark ? 'bg-amber-400' : 'bg-amber-500',
      rose: isDark ? 'bg-rose-400' : 'bg-rose-500',
    };
    return map[tone];
  };

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-xl transition-colors duration-300 ${
        isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-slate-50 border border-slate-200'
      }`}
    >
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Scroll tabs left"
        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300 ${
          isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto flex-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {jobs.map((job, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                  : isDark
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-white' : dotClass(job)}`} />
              Job {i + 1}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Scroll tabs right"
        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300 ${
          isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}