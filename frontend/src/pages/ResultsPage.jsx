import { useNavigate, useLocation } from 'react-router-dom';
import ScoreBadge from '../components/ScoreBadge';
import SkillTag from '../components/SkillTag';
import { ArrowLeft, AlertCircle, Briefcase } from 'lucide-react';

export default function ResultsPage({ isDark }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get results from navigation state
  const { results, fileName } = location.state || {};

  // Handle case where user navigates directly to /results without state
  if (!results || !Array.isArray(results.results)) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className={`rounded-2xl shadow-xl border p-8 text-center transition-all duration-300 ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700/50' 
            : 'bg-white border-indigo-100/50'
        }`}>
          <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-700'
          }`}>No Results</h3>
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

  return (
    <div className="max-w-5xl mx-auto animate-fade-slide-up">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className={`flex items-center gap-2 mb-8 px-4 py-2 rounded-lg transition-all duration-300 ${
          isDark 
            ? 'text-indigo-400 hover:bg-slate-700/50' 
            : 'text-indigo-600 hover:bg-indigo-50'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Upload
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-display font-bold mb-2 transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>Analysis Results</h1>
        <p className={`transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Resume: <span className="font-semibold">{fileName}</span>
        </p>
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        {results.results.map((result, index) => {
          // Handle error results
          if (result.error) {
            return (
              <div 
                key={index}
                className={`rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 ${
                  isDark 
                    ? 'bg-slate-800/80 border-slate-700/50' 
                    : 'bg-white border-indigo-100/50'
                }`}
              >
                <div className={`border-b p-6 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {result.jobDescription?.substring(0, 100)}...
                      </h2>
                      <p className={`text-sm transition-colors duration-300 ${
                        isDark ? 'text-rose-400' : 'text-rose-600'
                      }`}>
                        ❌ {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Handle successful results
          return (
            <div 
              key={index}
              className={`rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700/50' 
                  : 'bg-white border-indigo-100/50'
              }`}
            >
              {/* Job Description Header */}
              <div className={`border-b p-6 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 flex-shrink-0 text-indigo-600" />
                      <h2 className={`text-lg font-semibold transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        Job Match Analysis
                      </h2>
                    </div>
                    <p className={`text-sm line-clamp-2 transition-colors duration-300 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {result.jobDescription}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ScoreBadge score={result.score} isDark={isDark} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Feedback Section */}
                {result.feedback && (
                  <div className="mb-6">
                    <h3 className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>📋 Feedback</h3>
                    <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {result.feedback}
                    </p>
                  </div>
                )}

                {/* Matched Skills */}
                {result.matchedSkills && result.matchedSkills.length > 0 && (
                  <div className="mb-6">
                    <h3 className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>✅ Matched Skills ({result.matchedSkills.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, i) => (
                        <SkillTag key={i} skill={skill} type="matched" isDark={isDark} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {result.missingSkills && result.missingSkills.length > 0 && (
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>⚠️ Missing Skills ({result.missingSkills.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill, i) => (
                        <SkillTag key={i} skill={skill} type="missing" isDark={isDark} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
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