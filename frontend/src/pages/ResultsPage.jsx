import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ScoreGauge from '../components/ScoreGauge';
import SkillTag from '../components/SkillTag';
import FeedbackCard from '../components/FeedbackCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Briefcase,
  Award
} from 'lucide-react';

export default function ResultsPage({ isDark }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, fileName } = location.state || {};
  const [selectedJob, setSelectedJob] = useState(0);
  const [jobResults, setJobResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!results) {
      navigate('/');
      return;
    }

    // Parse the results to handle multiple jobs
    let jobs = [];
    if (Array.isArray(results)) {
      jobs = results;
    } else if (results.results && Array.isArray(results.results)) {
      jobs = results.results;
    } else if (results.score !== undefined) {
      jobs = [results];
    } else {
      jobs = [results];
    }
    setJobResults(jobs);
    setLoading(false);
  }, [results, navigate]);

  if (loading) {
    return <SkeletonLoader isDark={isDark} />;
  }

  if (!results) return null;

  const currentJob = jobResults[selectedJob] || {};
  const hasError = currentJob.error || currentJob.message?.includes('failed');

  const nextJob = () => {
    if (selectedJob < jobResults.length - 1) {
      setSelectedJob(selectedJob + 1);
    }
  };

  const prevJob = () => {
    if (selectedJob > 0) {
      setSelectedJob(selectedJob - 1);
    }
  };

  // Calculate summary statistics
  const totalJobs = jobResults.length;
  const successfulJobs = jobResults.filter(j => !j.error && !j.message?.includes('failed')).length;
  const failedJobs = totalJobs - successfulJobs;

  // Truncate job description for display
  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-slide-up">
      <button
        onClick={() => navigate('/')}
        className={`flex items-center gap-2 transition-colors duration-300 mb-6 group ${
          isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-600 hover:text-indigo-600'
        }`}
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Upload
      </button>

      <div className={`rounded-2xl shadow-xl border p-6 sm:p-8 mb-8 transition-all duration-300 ${
        isDark 
          ? 'bg-slate-800/80 border-slate-700/50' 
          : 'bg-white border-indigo-100/50'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <FileText className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-display font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>Analysis Results</h1>
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>{fileName || 'Resume'}</p>
            </div>
          </div>
          
          {/* Summary Badge */}
          <div className="flex items-center gap-3">
            <div className={`text-xs px-3 py-1.5 rounded-full transition-colors duration-300 ${
              isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {successfulJobs}/{totalJobs} analyzed
            </div>
            {failedJobs > 0 && (
              <div className="text-xs px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-500 dark:text-rose-400">
                {failedJobs} failed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Navigation */}
      {jobResults.length > 1 && (
        <div className={`flex items-center justify-between gap-4 mb-6 p-4 rounded-xl transition-all duration-300 ${
          isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-slate-50 border border-slate-200'
        }`}>
          <button
            onClick={prevJob}
            disabled={selectedJob === 0}
            className={`p-2 rounded-lg transition-all duration-300 ${
              selectedJob === 0
                ? isDark ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed'
                : isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2 overflow-x-auto px-2 flex-1">
            {jobResults.map((job, index) => {
              const isError = job.error || job.message?.includes('failed');
              const jobPreview = truncateText(job.jobDescription || `Job ${index + 1}`, 30);
              return (
                <button
                  key={index}
                  onClick={() => setSelectedJob(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedJob === index
                      ? isDark 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : isDark
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  } ${isError ? 'border border-rose-500/30' : ''}`}
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3" />
                    <span className="max-w-[120px] truncate">{jobPreview}</span>
                    {isError && <AlertCircle className="w-3 h-3 text-rose-500" />}
                    {!isError && job.score !== undefined && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        isDark ? 'bg-slate-600' : 'bg-white/50'
                      }`}>
                        {job.score}%
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          
          <button
            onClick={nextJob}
            disabled={selectedJob === jobResults.length - 1}
            className={`p-2 rounded-lg transition-all duration-300 ${
              selectedJob === jobResults.length - 1
                ? isDark ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed'
                : isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <span className={`text-xs transition-colors duration-300 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {selectedJob + 1} / {jobResults.length}
          </span>
        </div>
      )}

      {/* Current Job Results */}
      {hasError ? (
        <div className={`border rounded-2xl p-8 text-center transition-colors duration-300 ${
          isDark ? 'bg-rose-900/20 border-rose-800' : 'bg-rose-50 border-rose-200'
        }`}>
          <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
            Analysis Failed
          </h3>
          <p className={isDark ? 'text-rose-300' : 'text-rose-600'}>
            {currentJob.message || currentJob.error || 'Unable to analyze this job description'}
          </p>
          {currentJob.jobDescription && (
            <div className={`mt-4 p-3 rounded-lg text-left text-sm max-h-32 overflow-y-auto ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'
            }`}>
              <p className="font-medium mb-1">Job Description:</p>
              <p className="text-xs">{currentJob.jobDescription}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Job Description Header */}
          {currentJob.jobDescription && (
            <div className={`rounded-2xl shadow-xl border p-6 transition-all duration-300 ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700/50' 
                : 'bg-white border-indigo-100/50'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  isDark ? 'bg-indigo-600/20' : 'bg-indigo-50'
                }`}>
                  <Briefcase className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold mb-1 transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>Job Description</h3>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}>{currentJob.jobDescription}</p>
                </div>
              </div>
            </div>
          )}

          {/* Score Section */}
          <div className={`rounded-2xl shadow-xl border p-6 sm:p-8 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-800/80 border-slate-700/50' 
              : 'bg-white border-indigo-100/50'
          }`}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center">
                <ScoreGauge score={currentJob.score || 0} isDark={isDark} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  <h2 className={`text-xl font-display font-bold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Match Score
                  </h2>
                </div>
                <p className={`mb-4 transition-colors duration-300 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Your resume matches {currentJob.score || 0}% of the job requirements
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Strong (70-100%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Moderate (40-69%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Weak (0-39%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`rounded-2xl shadow-xl border p-6 transition-all duration-300 ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700/50' 
                : 'bg-white border-indigo-100/50'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <h3 className={`font-semibold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>Matched Skills</h3>
                <span className={`ml-auto text-sm transition-colors duration-300 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {currentJob.matchedSkills?.length || 0}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(currentJob.matchedSkills || []).map((skill, i) => (
                  <SkillTag key={i} skill={skill} type="matched" isDark={isDark} />
                ))}
                {(!currentJob.matchedSkills || currentJob.matchedSkills.length === 0) && (
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No matched skills found</p>
                )}
              </div>
            </div>

            <div className={`rounded-2xl shadow-xl border p-6 transition-all duration-300 ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700/50' 
                : 'bg-white border-indigo-100/50'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-rose-500" />
                <h3 className={`font-semibold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>Missing Skills</h3>
                <span className={`ml-auto text-sm transition-colors duration-300 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {currentJob.missingSkills?.length || 0}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(currentJob.missingSkills || []).map((skill, i) => (
                  <SkillTag key={i} skill={skill} type="missing" isDark={isDark} />
                ))}
                {(!currentJob.missingSkills || currentJob.missingSkills.length === 0) && (
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No missing skills identified</p>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          {currentJob.feedback && (
            <FeedbackCard feedback={currentJob.feedback} isDark={isDark} />
          )}
        </div>
      )}
    </div>
  );
}