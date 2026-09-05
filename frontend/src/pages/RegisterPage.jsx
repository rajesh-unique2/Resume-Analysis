import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import { Sparkles, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage({ isDark }) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-slide-up px-4 sm:px-0">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className={`text-2xl sm:text-3xl font-display font-bold transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Create your account
        </h1>
        <p className={`mt-1 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Your resume analyses will be saved just for you
        </p>
      </div>

      <div className={`rounded-2xl shadow-xl border p-6 sm:p-8 transition-all duration-300 ${
        isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-indigo-100/50'
      }`}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Name <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>(optional)</span>
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={`w-full rounded-xl border pl-10 pr-4 py-2.5 transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base ${
                  isDark
                    ? 'bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500'
                    : 'border-indigo-200 text-slate-700 placeholder:text-slate-400'
                }`}
                placeholder="Jane Doe"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={`w-full rounded-xl border pl-10 pr-4 py-2.5 transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base ${
                  isDark
                    ? 'bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500'
                    : 'border-indigo-200 text-slate-700 placeholder:text-slate-400'
                }`}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={`w-full rounded-xl border pl-10 pr-4 py-2.5 transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base ${
                  isDark
                    ? 'bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500'
                    : 'border-indigo-200 text-slate-700 placeholder:text-slate-400'
                }`}
                placeholder="At least 8 characters"
              />
            </div>
          </div>

          {error && (
            <div className={`border rounded-xl p-3 text-sm flex items-start gap-2 ${
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
            <span>{loading ? 'Creating account…' : 'Create account'}</span>
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </div>

      <p className={`text-center mt-6 text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
          Log in
        </Link>
      </p>
    </div>
  );
}