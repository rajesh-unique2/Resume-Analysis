import { Check, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function ChecklistItem({ check, index, isDark }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [index]);

  // Handle different check object structures
  const checkName = check.label || check.name || 'Check item';
  const checkPassed = check.passed !== undefined ? check.passed : (check.status === 'pass' || check.status === true);
  const checkNote = check.note || check.details || '';

  const Icon = checkPassed ? Check : X;
  const iconColor = checkPassed ? 'text-emerald-500' : 'text-rose-500';
  const bgColor = checkPassed 
    ? (isDark ? 'bg-emerald-500/20' : 'bg-emerald-50') 
    : (isDark ? 'bg-rose-500/20' : 'bg-rose-50');
  const borderColor = checkPassed 
    ? (isDark ? 'border-emerald-500/30' : 'border-emerald-200') 
    : (isDark ? 'border-rose-500/30' : 'border-rose-200');

  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 p-3 rounded-xl border ${borderColor} ${bgColor} transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bgColor}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-slate-700'
        }`}>{checkName}</p>
        {checkNote && (
          <p className={`text-xs transition-colors duration-300 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>{checkNote}</p>
        )}
      </div>
    </div>
  );
}