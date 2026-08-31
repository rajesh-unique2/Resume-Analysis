import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';

export default function BulletRewriteCard({ bullet, index, isDark }) {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200 + index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(bullet.improved || bullet.rewritten || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const original = bullet.original || '';
  const improved = bullet.improved || bullet.rewritten || '';

  return (
    <div
      className={`border rounded-xl p-4 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${isDark ? 'border-slate-700' : 'border-indigo-100'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
          isDark ? 'bg-purple-500/20' : 'bg-purple-50'
        }`}>
          <Sparkles className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm mb-1 line-through transition-colors duration-300 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>Original:</p>
          <p className={`text-sm mb-3 transition-colors duration-300 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>{original || 'No original text provided'}</p>
          <p className={`text-sm mb-1 transition-colors duration-300 ${
            isDark ? 'text-slate-400' : 'text-slate-400'
          }`}>✨ Suggested:</p>
          <p className={`text-sm font-medium transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>{improved || 'No improved version provided'}</p>
        </div>
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 p-2 rounded-lg transition-all duration-300 ${
            isDark 
              ? 'text-slate-500 hover:text-indigo-400 hover:bg-slate-700' 
              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}