import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import JobTabs from '../components/JobTabs';
import JobResultDetail from '../components/JobResultDetail';
import { ArrowLeft, AlertCircle, Layers, TrendingUp, ShieldCheck } from 'lucide-react';

function SummaryStat({ icon: Icon, label, value, isDark }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl p-3 sm:p-4 transition-colors duration-300 ${
        isDark ? 'bg-slate-700/40' : 'bg-slate-50'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
          isDark ? 'bg-indigo-600/20' : 'bg-indigo-50'
        }`}
      >
        <Icon className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-lg font-bold leading-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {value}
        </p>
        <p className={`text-xs transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      </div>
    </div>
  );
}

export default function ResultsPage({ isDark }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { results, fileName } = location.state || {};
  const [activeIndex, setActiveIndex] = useState(0);

  const jobs = results?.results;

  const stats = useMemo(() => {
    if (!Array.isArray(jobs) || jobs.length === 0) return null;
    const successful = jobs.filter((j) => !j.error);
    const avg = successful.length
      ? Math.round(successful.reduce((sum, j) => sum + (j.score || 0), 0) / successful.length)
      : 0;
    return { total: jobs.length, successCount: successful.length, avg };
  }, [jobs]);

  // Handle direct navigation to /results without state
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-slide-up">
        <div
          className={`rounded-2xl shadow-xl border p-8 text-center transition-all duration-300 ${
            isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-indigo-100/50'
          }`}
        >
          <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-700'}`}>
            No Results
          </h3>
          <p className={`mb-6 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Please upload a resume and job description to see analysis results
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all duration-300"
          >
            Back to Upload
          </button>
        </div>
      </div>
    );
  }

  const activeJob = jobs[activeIndex];

  return (
    <div className="max-w-5xl mx-auto animate-fade-slide-up">
      <button
        onClick={() => navigate('/')}
        className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-all duration-300 ${
          isDark ? 'text-indigo-400 hover:bg-slate-700/50' : 'text-indigo-600 hover:bg-indigo-50'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Upload
      </button>

      {/* Summary header */}
      <div
        className={`rounded-2xl shadow-xl border p-6 sm:p-8 mb-6 transition-all duration-300 ${
          isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-indigo-100/50'
        }`}
      >
        <h1 className={`text-2xl sm:text-3xl font-display font-bold mb-1 transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Analysis Results
        </h1>
        <p className={`mb-5 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Resume: <span className="font-semibold">{fileName}</span>
        </p>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <SummaryStat icon={Layers} label="Jobs analyzed" value={stats.total} isDark={isDark} />
          <SummaryStat icon={TrendingUp} label="Average score" value={`${stats.avg}%`} isDark={isDark} />
          <SummaryStat icon={ShieldCheck} label="Successful" value={`${stats.successCount}/${stats.total}`} isDark={isDark} />
        </div>
      </div>

      {/* Job tab navigation - only shown when there's more than one job */}
      {jobs.length > 1 && (
        <div className="mb-6">
          <JobTabs jobs={jobs} activeIndex={activeIndex} onSelect={setActiveIndex} isDark={isDark} />
        </div>
      )}

      {/* key={activeIndex} forces a remount on tab switch, which restarts
          the animate-fade-slide-up / staggered skill animations so each
          job feels like a fresh reveal instead of an instant content swap. */}
      <JobResultDetail key={activeIndex} result={activeJob} isDark={isDark} />

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          onClick={() => navigate('/')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
            isDark
              ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30'
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          Analyze Another Resume
        </button>
        <button
          onClick={() => navigate('/ats')}
          className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all duration-300"
        >
          Check ATS Compatibility
        </button>
      </div>
    </div>
  );
}