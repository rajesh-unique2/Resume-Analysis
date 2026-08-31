import { useState } from 'react';
import { checkATS } from '../services/api';
import ATSSkeletonLoader from '../components/ATSSkeletonLoader';
import ChecklistItem from '../components/ChecklistItem';
import BulletRewriteCard from '../components/BulletRewriteCard';
import { FileSearch, Shield, Zap, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ATSCheckPage({ isDark }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a resume');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const data = await checkATS(formData);
      console.log('ATS Result:', data);
      setResult(data);
    } catch (err) {
      setError(err.message || 'ATS check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ATSSkeletonLoader isDark={isDark} />;
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-slide-up">
        <button
          onClick={() => setResult(null)}
          className={`flex items-center gap-2 transition-colors duration-300 mb-6 group ${
            isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-600 hover:text-indigo-600'
          }`}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          New Check
        </button>

        <div className={`rounded-2xl shadow-xl border p-6 sm:p-8 mb-8 transition-all duration-300 ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700/50' 
            : 'bg-white border-indigo-100/50'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-display font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>ATS Score</h1>
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{result.atsScore || 0}%</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-2xl shadow-xl border p-6 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-800/80 border-slate-700/50' 
              : 'bg-white border-indigo-100/50'
          }`}>
            <h2 className={`font-semibold mb-4 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>Formatting Checklist</h2>
            <div className="space-y-3">
              {result.checks && result.checks.length > 0 ? (
                result.checks.map((check, index) => (
                  <ChecklistItem key={index} check={check} index={index} isDark={isDark} />
                ))
              ) : (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  No checklist items available
                </p>
              )}
            </div>
          </div>

          {result.rewrittenBullets && result.rewrittenBullets.length > 0 && (
            <div className={`rounded-2xl shadow-xl border p-6 transition-all duration-300 ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700/50' 
                : 'bg-white border-indigo-100/50'
            }`}>
              <h2 className={`font-semibold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>AI-Suggested Rewrites</h2>
              <div className="space-y-4">
                {result.rewrittenBullets.map((bullet, index) => (
                  <BulletRewriteCard key={index} bullet={bullet} index={index} isDark={isDark} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-slide-up">
      <div className="text-center mb-10">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 transition-colors duration-300 ${
          isDark ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
        }`}>
          <FileSearch className="w-4 h-4" />
          ATS Optimization
        </div>
        <h1 className={`text-4xl font-display font-bold mb-4 transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          ATS <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Scanner</span>
        </h1>
        <p className={`text-lg transition-colors duration-300 ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Check if your resume is ATS-friendly and get AI-powered suggestions for improvement.
        </p>
      </div>

      <div className={`rounded-2xl shadow-xl border p-6 sm:p-8 transition-all duration-300 ${
        isDark 
          ? 'bg-slate-800/80 border-slate-700/50' 
          : 'bg-white border-indigo-100/50'
      }`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Upload Resume (PDF)
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required
              />
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDark 
                  ? 'border-slate-600 hover:border-indigo-500 bg-slate-700/30' 
                  : 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/30'
              }`}>
                <FileSearch className={`w-10 h-10 mx-auto mb-3 transition-colors duration-300 ${
                  isDark ? 'text-indigo-400' : 'text-indigo-400'
                }`} />
                <p className={`transition-colors duration-300 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {file ? (
                    <span className={`font-medium transition-colors duration-300 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {file.name}
                    </span>
                  ) : (
                    <>
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </>
                  )}
                </p>
                <p className={`text-xs mt-1 transition-colors duration-300 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>PDF only, max 5MB</p>
              </div>
            </div>
          </div>

          {error && (
            <div className={`border rounded-xl p-4 text-sm flex items-start gap-2 ${
              isDark ? 'bg-rose-900/20 border-rose-800 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Run ATS Check</span>
          </button>
        </form>
      </div>
    </div>
  );
}