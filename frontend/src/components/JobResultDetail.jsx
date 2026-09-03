import { useState, useEffect } from 'react';
import { Briefcase, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import FeedbackCard from './FeedbackCard';
import SkillTag from './SkillTag';

function StatChip({ label, value, tone, isDark }) {
  const tones = {
    emerald: isDark
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: isDark
      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
      : 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors duration-300 ${tones[tone]}`}
    >
      <span className="font-bold">{value}</span> {label}
    </span>
  );
}

function SkillGrid({ skills, type, isDark }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!skills || skills.length === 0) return null;

  const Icon = type === 'matched' ? CheckCircle2 : XCircle;
  const iconColor =
    type === 'matched'
      ? isDark
        ? 'text-emerald-400'
        : 'text-emerald-600'
      : isDark
        ? 'text-rose-400'
        : 'text-rose-600';

  return (
    <div
      className={`rounded-2xl shadow-xl border p-6 transition-colors duration-300 ${
        isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-indigo-100/50'
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h3
          className={`text-sm font-semibold transition-colors duration-300 ${
            isDark ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          {type === 'matched' ? 'Matched Skills' : 'Missing Skills'} ({skills.length})
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <div
            key={i}
            className="transition-all duration-500 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(8px)',
              transitionDelay: `${i * 40}ms`,
            }}
          >
            <SkillTag skill={skill} type={type} isDark={isDark} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Full detail panel for a single job's analysis result. Handles both the
 * success shape ({score, matchedSkills, missingSkills, feedback,
 * jobDescription}) and the per-job error shape ({error, message,
 * jobDescription}) that api.js produces when one job in a batch fails.
 */
export default function JobResultDetail({ result, isDark }) {
  if (result.error) {
    return (
      <div
        className={`rounded-2xl shadow-xl border p-6 sm:p-8 animate-fade-slide-up transition-colors duration-300 ${
          isDark ? 'bg-slate-800/80 border-rose-900/40' : 'bg-white border-rose-200'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDark ? 'bg-rose-500/15' : 'bg-rose-50'
            }`}
          >
            <AlertCircle className={`w-6 h-6 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
          </div>
          <div className="min-w-0">
            <h3
              className={`font-semibold mb-1 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              This job couldn't be analyzed
            </h3>
            <p className={`text-sm mb-3 transition-colors duration-300 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
              {result.message}
            </p>
            {result.jobDescription && (
              <p
                className={`text-xs line-clamp-3 transition-colors duration-300 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {result.jobDescription}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-slide-up">
      <div
        className={`rounded-2xl shadow-xl border p-6 sm:p-8 transition-colors duration-300 ${
          isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-indigo-100/50'
        }`}
      >
        <div className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center">
          <div className="flex justify-center">
            <ScoreGauge score={result.score} isDark={isDark} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <h2
                className={`text-lg font-semibold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Job Description
              </h2>
            </div>
            <p
              className={`text-sm leading-relaxed line-clamp-4 transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {result.jobDescription}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <StatChip label="matched" value={result.matchedSkills?.length || 0} tone="emerald" isDark={isDark} />
              <StatChip label="missing" value={result.missingSkills?.length || 0} tone="rose" isDark={isDark} />
            </div>
          </div>
        </div>
      </div>

      <FeedbackCard feedback={result.feedback} isDark={isDark} />

      <div className="grid md:grid-cols-2 gap-6">
        <SkillGrid skills={result.matchedSkills} type="matched" isDark={isDark} />
        <SkillGrid skills={result.missingSkills} type="missing" isDark={isDark} />
      </div>
    </div>
  );
}