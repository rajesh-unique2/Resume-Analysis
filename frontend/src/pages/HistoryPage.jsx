import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteHistoryItem } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';
import { Clock, Calendar, FileText, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';

export default function HistoryPage({ isDark }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadHistory = async (ignore) => {
    setLoading(true);
    setError('');
    try {
      const data = await getHistory();
      if (ignore?.current) return; // a newer/older call already won, ignore this one
      setHistory(data || []);
    } catch (err) {
      if (ignore?.current) return;
      setError('Failed to load history');
    } finally {
      if (!ignore?.current) setLoading(false);
    }
  };

  useEffect(() => {
    const ignore = { current: false };
    loadHistory(ignore);
    return () => {
      ignore.current = true; // cancels this call if the effect re-runs (StrictMode) or component unmounts
    };
  }, []);

  const handleDelete = async (id) => {
    if (!id) return;
    const confirmed = window.confirm('Delete this analysis? This cannot be undone.');
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError('Failed to delete history item');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className={`h-8 w-48 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-64 rounded-lg mt-1 ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}></div>
          </div>
          <div className={`h-10 w-24 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
        </div>

        <div className={`rounded-2xl shadow-xl border overflow-hidden ${isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200'}`}>
          <div className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="grid grid-cols-4 gap-4 p-4">
              <div className={`h-4 w-16 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
              <div className={`h-4 w-24 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
              <div className={`h-4 w-12 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
              <div className={`h-4 w-16 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            </div>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-4 gap-4 p-4">
                <div className={`h-4 w-32 rounded ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}></div>
                <div className={`h-4 w-48 rounded ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}></div>
                <div className={`h-6 w-12 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                <div className={`h-4 w-24 rounded ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-slide-up">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className={`text-3xl font-display font-bold transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>Analysis History</h1>
          <p className={`transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            View all your past resume analyses
          </p>
        </div>
        <button
          onClick={loadHistory}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            isDark 
              ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30' 
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className={`border rounded-xl p-4 text-sm flex items-start gap-2 mb-6 ${
          isDark ? 'bg-rose-900/20 border-rose-800 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {history.length === 0 ? (
        <div className={`rounded-2xl shadow-xl border p-12 text-center transition-all duration-300 ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700/50' 
            : 'bg-white border-indigo-100/50'
        }`}>
          <Clock className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-700'
          }`}>No History Yet</h3>
          <p className={`transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Your past analyses will appear here
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all duration-300"
          >
            Analyze Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className={`hidden sm:block rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 ${
            isDark 
              ? 'bg-slate-800/80 border-slate-700/50' 
              : 'bg-white border-indigo-100/50'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b transition-colors duration-300 ${
                  isDark ? 'bg-slate-700/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <tr>
                    <th className={`text-left px-6 py-4 text-sm font-semibold transition-colors duration-300 ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>File</th>
                    <th className={`text-left px-6 py-4 text-sm font-semibold transition-colors duration-300 ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>Job Description</th>
                    <th className={`text-left px-6 py-4 text-sm font-semibold transition-colors duration-300 ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>Score</th>
                    <th className={`text-left px-6 py-4 text-sm font-semibold transition-colors duration-300 ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>Date</th>
                    <th className={`text-left px-6 py-4 text-sm font-semibold transition-colors duration-300 ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      <span className="sr-only">Delete</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={index} className={`border-b transition-colors duration-300 ${
                      isDark 
                        ? 'border-slate-700/50 hover:bg-slate-700/30' 
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                          <span className={`text-sm truncate max-w-[150px] transition-colors duration-300 ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}>{item.fileName}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm truncate max-w-[200px] transition-colors duration-300 ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {item.jobDescription}
                      </td>
                      <td className="px-6 py-4">
                        <ScoreBadge score={item.score} isDark={isDark} />
                      </td>
                      <td className={`px-6 py-4 text-sm transition-colors duration-300 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingId === item._id}
                          aria-label="Delete this analysis"
                          className={`p-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDark
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-900/20'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-4">
            {history.map((item, index) => (
              <div key={index} className={`rounded-xl shadow-lg border p-4 transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700/50' 
                  : 'bg-white border-indigo-100/50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium truncate transition-colors duration-300 ${
                      isDark ? 'text-white' : 'text-slate-700'
                    }`}>{item.fileName}</span>
                  </div>
                  <ScoreBadge score={item.score} isDark={isDark} />
                </div>
                <p className={`text-sm mb-2 line-clamp-2 transition-colors duration-300 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>{item.jobDescription}</p>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-1 text-xs transition-colors duration-300 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    aria-label="Delete this analysis"
                    className={`p-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-900/20'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}