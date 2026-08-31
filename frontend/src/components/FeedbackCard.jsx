import { Lightbulb } from 'lucide-react';

export default function FeedbackCard({ feedback, isDark }) {
  if (!feedback) return null;

  return (
    <div className={`rounded-2xl shadow-xl border p-6 transition-all duration-300 ${
      isDark 
        ? 'bg-slate-800/50 border-slate-700/50' 
        : 'bg-white border-indigo-100/50'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
          isDark ? 'bg-indigo-600/20' : 'bg-indigo-50'
        }`}>
          <Lightbulb className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
        </div>
        <div>
          <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>AI Feedback</h3>
          <div className={`prose prose-sm max-w-none whitespace-pre-wrap transition-colors duration-300 ${
            isDark ? 'text-slate-300 prose-strong:text-white' : 'text-slate-600'
          }`}>
            {feedback}
          </div>
        </div>
      </div>
    </div>
  );
}