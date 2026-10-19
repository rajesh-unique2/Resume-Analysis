import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, Mic, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCommunicationQuestion, submitCommunicationAssessment } from '../services/api';

const firstQuestion = 'Tell me about yourself, your education, and the kind of work you hope to do.';

export default function VoicePracticePage({ isDark }) {
  const navigate = useNavigate();
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const startedAtRef = useRef(0);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [draft, setDraft] = useState('');
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000)), 500);
    return () => window.clearInterval(timer);
  }, [recording]);

  const begin = async () => {
    setError('');
    setStarted(true);
    setQuestion(firstQuestion);
    try {
      const response = await getCommunicationQuestion([]);
      setQuestion(response.question);
    } catch (err) {
      setError(err.message || 'Could not start the AI interviewer. You can use the default question.');
    }
  };

  const startRecording = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('Voice recording is not supported here. Type your answer in the transcript box instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = () => {};
      recorder.onerror = () => setError('The recording stopped unexpectedly. Please try again.');
      recorderRef.current = recorder;
      recorder.start();
      startedAtRef.current = Date.now();
      setSeconds(0);
      setRecording(true);

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event) => {
          let text = '';
          for (let index = 0; index < event.results.length; index += 1) text += `${event.results[index][0].transcript} `;
          setDraft(text.trim());
        };
        recognition.onerror = () => setError('Automatic transcription is unavailable. You can edit the transcript manually.');
        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      setError(err.name === 'NotAllowedError'
        ? 'Microphone permission was denied. Type your answer below or allow microphone access and try again.'
        : 'Unable to start the microphone. Type your answer below instead.');
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    recognitionRef.current?.stop();
    recorderRef.current = null;
    streamRef.current = null;
    recognitionRef.current = null;
    setRecording(false);
  };

  const next = async () => {
    if (!draft.trim()) {
      setError('Add or dictate an answer before continuing.');
      return;
    }
    const nextAnswers = [...answers, { question, answer: draft.trim() }];
    setAnswers(nextAnswers);
    setDraft('');
    setError('');
    if (nextAnswers.length >= 8) return finish(nextAnswers);
    setLoading(true);
    try {
      const response = await getCommunicationQuestion(nextAnswers);
      setQuestion(response.question);
    } catch (err) {
      setError(err.message || 'Could not get the next question.');
    } finally {
      setLoading(false);
    }
  };

  const finish = async (completedAnswers = answers) => {
    if (recording) stopRecording();
    if (!completedAnswers.length && !draft.trim()) {
      setError('Complete at least one answer before finishing.');
      return;
    }
    const finalAnswers = completedAnswers.length
      ? (draft.trim() && completedAnswers[completedAnswers.length - 1]?.answer !== draft.trim()
        ? [...completedAnswers, { question, answer: draft.trim() }]
        : completedAnswers)
      : [{ question, answer: draft.trim() }];
    setLoading(true);
    setError('');
    try {
      setReport(await submitCommunicationAssessment(finalAnswers));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const panel = isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-indigo-100/50';
  const heading = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const input = `w-full rounded-xl border px-3 py-3 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`;
  const level = report ? (report.overallScore >= 90 ? 'Excellent' : report.overallScore >= 75 ? 'Good' : report.overallScore >= 60 ? 'Developing' : 'Needs improvement') : '';

  return (
    <div className="max-w-4xl mx-auto animate-fade-slide-up">
      <button onClick={() => navigate('/')} className={`flex items-center gap-2 mb-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}><ArrowLeft className="w-4 h-4" /> Back to Analyze</button>
      <div className={`rounded-2xl shadow-xl border p-6 sm:p-8 ${panel}`}>
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600"><Mic className="w-6 h-6" /></div>
          <div><h1 className={`text-2xl sm:text-3xl font-display font-bold ${heading}`}>English Communication Test</h1><p className={muted}>Answer 5–8 questions. We assess your words and ideas, not your accent or background.</p></div>
        </div>
        {!started ? (
          <div className="space-y-4"><p className={muted}>Your microphone is used only while you record. Audio is not uploaded or saved; your editable transcript is sent securely to Gemini for feedback.</p><ul className={`list-disc pl-5 text-sm ${muted}`}><li>Allow microphone access when prompted.</li><li>Speak naturally and use the text fallback if needed.</li><li>You can finish early after one answer.</li></ul><button onClick={begin} className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold">Start assessment</button></div>
        ) : !report ? (
          <div>
            <div className="flex items-center justify-between mb-3 text-sm"><span className={muted}>Question {Math.min(answers.length + 1, 8)} of 8</span><span className={muted}>{seconds}s</span></div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 mb-6"><div className="h-2 rounded-full bg-indigo-600 transition-all" style={{ width: `${Math.min(100, ((answers.length + 1) / 8) * 100)}%` }} /></div>
            <h2 className={`text-xl font-semibold mb-5 ${heading}`}>{question}</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              <button onClick={recording ? stopRecording : startRecording} className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-white font-semibold ${recording ? 'bg-rose-600' : 'bg-indigo-600'}`}>{recording ? <><Square className="w-4 h-4" /> Stop recording</> : <><Mic className="w-4 h-4" /> Start recording</>}</button>
              {recording && <span className={`self-center text-sm ${muted}`}>Recording… {seconds}s</span>}
            </div>
            <label htmlFor="communication-transcript" className={`block text-sm font-medium mb-2 ${heading}`}>Your transcript <span className={`font-normal ${muted}`}>(editable fallback)</span></label>
            <textarea id="communication-transcript" value={draft} onChange={(event) => setDraft(event.target.value)} rows={6} className={input} placeholder="Speak or type your answer here…" />
            {error && <p role="alert" className="mt-3 text-sm text-rose-500">{error}</p>}
            <div className="flex flex-wrap gap-3 mt-5"><button onClick={next} disabled={loading || recording} className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Next question'}</button><button onClick={() => finish()} disabled={loading || recording} className={`px-5 py-3 rounded-xl border font-semibold ${muted}`}>Finish early</button></div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6"><div><p className={`text-sm ${muted}`}>{level}</p><p className={`text-5xl font-bold ${heading}`}>{report.overallScore}<span className="text-xl font-normal">/100</span></p></div><CheckCircle2 className="w-12 h-12 text-emerald-500" /></div>
            <div className="grid sm:grid-cols-5 gap-3 mb-6">{Object.entries(report.categoryScores).map(([name, score]) => <div key={name} className={`rounded-xl p-3 text-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}><div className={`font-bold ${heading}`}>{score}</div><div className={`text-xs capitalize ${muted}`}>{name}</div></div>)}</div>
            <ReportList title="Strengths" items={report.strengths} heading={heading} muted={muted} />
            <ReportList title="Recommendations" items={report.recommendations} heading={heading} muted={muted} />
            {report.grammarCorrections.length > 0 && <div className="mt-5"><h3 className={`font-semibold ${heading}`}>Grammar improvements</h3>{report.grammarCorrections.map((item) => <p key={item.original} className={`mt-2 text-sm ${muted}`}><s>{item.original}</s> → <strong className={heading}>{item.corrected}</strong></p>)}</div>}
            <button onClick={() => { setReport(null); setStarted(false); setAnswers([]); setDraft(''); }} className="mt-6 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold">Take another assessment</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportList({ title, items, heading, muted }) {
  if (!items?.length) return null;
  return <div className="mt-5"><h3 className={`font-semibold ${heading}`}>{title}</h3><ul className={`list-disc pl-5 mt-2 space-y-1 text-sm ${muted}`}>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}
