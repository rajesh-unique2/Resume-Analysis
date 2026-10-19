import { useState } from 'react';
import { ArrowLeft, Check, FileSearch, Loader2, Sparkles, Target, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { optimizeResume } from '../services/api';

export default function OptimizerPage({ isDark }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const panel = isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-indigo-100/50';
  const heading = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const input = `w-full rounded-xl border px-3 py-3 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`;

  const submit = async (event) => {
    event.preventDefault();
    if (!file || !jobDescription.trim()) {
      setError('Upload a PDF resume and add a job description.');
      return;
    }
    setLoading(true); setError('');
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);
    try { setResult(await optimizeResume(formData)); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return <div className="max-w-5xl mx-auto animate-fade-slide-up">
    <button onClick={() => navigate('/')} className={`flex items-center gap-2 mb-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}><ArrowLeft className="w-4 h-4" /> Back to Analyze</button>
    <div className={`rounded-2xl border p-6 sm:p-8 ${panel}`}>
      <div className="flex items-start gap-4 mb-7"><div className="p-3 rounded-xl bg-indigo-100 text-indigo-600"><Target /></div><div><h1 className={`text-3xl font-bold ${heading}`}>Resume-to-Job Optimizer</h1><p className={`mt-1 ${muted}`}>See what your resume proves, what the role asks for, and what to improve next.</p></div></div>
      {!result ? <form onSubmit={submit} className="space-y-5"><label className={`block font-medium ${heading}`}>Resume PDF<input type="file" accept=".pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className={`${input} mt-2`} /><span className={`block text-xs mt-1 ${muted}`}>{file ? file.name : 'PDF only, max 5MB'}</span></label><label className={`block font-medium ${heading}`}>Job description<textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} className={`${input} mt-2`} rows={9} placeholder="Paste the job description here..." /></label>{error && <p className="text-sm text-rose-400">{error}</p>}<button disabled={loading} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50">{loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />} Analyze keyword fit</button></form> : <OptimizerResult result={result} heading={heading} muted={muted} isDark={isDark} onReset={() => setResult(null)} /> }
    </div>
  </div>;
}

function OptimizerResult({ result, heading, muted, isDark, onReset }) {
  return <div><div className="flex items-center justify-between gap-3 mb-6"><div><p className={`text-sm ${muted}`}>Keyword coverage</p><p className={`text-5xl font-bold ${heading}`}>{result.keywordCoverage}%</p></div><button onClick={onReset} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${muted}`}><X className="w-4 h-4" /> New scan</button></div><div className="grid sm:grid-cols-5 gap-3 mb-7">{Object.entries(result.scorecard).map(([key, value]) => <div key={key} className={`rounded-xl p-3 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}><p className={`text-xl font-bold ${heading}`}>{value}</p><p className={`text-xs capitalize ${muted}`}>{key.replace(/([A-Z])/g, ' $1')}</p></div>)}</div><div className="grid md:grid-cols-2 gap-5"><KeywordList title="Already present" items={result.presentKeywords} icon={Check} color="text-emerald-400" /><KeywordList title="Missing keywords" items={result.missingKeywords} icon={FileSearch} color="text-amber-400" /></div><div className="mt-7"><h2 className={`font-semibold ${heading}`}>Priority actions</h2><ul className={`list-disc pl-5 mt-2 space-y-2 ${muted}`}>{result.priorityActions.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="mt-7"><h2 className={`font-semibold ${heading}`}>Where to improve</h2><div className="space-y-3 mt-3">{result.suggestions.map((item) => <div key={`${item.keyword}-${item.placement}`} className={`rounded-xl p-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}><p className={`font-semibold ${heading}`}>{item.keyword} <span className={`font-normal text-sm ${muted}`}>· {item.placement}</span></p><p className={`text-sm mt-1 ${muted}`}>{item.example}</p></div>)}</div></div></div>;
}

function KeywordList({ title, items, icon: Icon, color }) {
  return <div><h2 className="font-semibold mb-3">{title}</h2><div className="flex flex-wrap gap-2">{items.map((item) => <span key={item} className="inline-flex items-center gap-1 rounded-full bg-slate-700/50 px-3 py-1.5 text-sm"><Icon className={`w-3.5 h-3.5 ${color}`} />{item}</span>)}</div></div>;
}
