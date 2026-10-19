import { useEffect, useState } from 'react';
import { ArrowLeft, Download, FileText, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteSavedResume, generateResumeRequest, getSavedResumes, updateSavedResume } from '../services/api';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

const emptyEducation = { institution: '', degree: '', field: '', year: '', achievements: '' };
const emptyExperience = { title: '', company: '', dates: '', responsibilities: '', achievements: '' };
const emptyProject = { title: '', technologies: '', description: '', contributions: '', link: '' };
const initialData = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', portfolio: '' },
  summary: '', targetRole: '', yearsExperience: '', education: [{ ...emptyEducation }],
  technicalSkills: '', programmingLanguages: '', frameworks: '', softSkills: '', certifications: '',
  experience: [{ ...emptyExperience }], projects: [{ ...emptyProject }],
  additional: { internships: '', languages: '', achievements: '' },
};

const steps = ['Personal', 'Summary', 'Education', 'Skills', 'Experience', 'Projects', 'Additional'];

async function downloadDocx(data, content) {
  const text = (value) => String(value || '').trim();
  const children = [
    new Paragraph({ text: text(data.personalInfo.fullName), heading: HeadingLevel.TITLE }),
    new Paragraph(text([data.targetRole, data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean).join(' | '))),
  ];
  const addSection = (title, items) => {
    if (!items.length) return;
    children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }));
    children.push(...items);
  };
  if (text(content.summary)) addSection('Summary', [new Paragraph(text(content.summary))]);
  if (content.skills?.length) addSection('Skills', [new Paragraph(content.skills.join(', '))]);
  if (content.experience?.length) {
    addSection('Experience', content.experience.flatMap((item) => [
      new Paragraph({ children: [new TextRun({ text: `${text(item.title)}${item.company ? ` — ${text(item.company)}` : ''}`, bold: true })] }),
      new Paragraph(text(item.dates)),
      ...(item.bullets || []).map((bullet) => new Paragraph({ text: text(bullet), bullet: { level: 0 } })),
    ]));
  }
  if (content.education?.length) addSection('Education', content.education.map((item) => new Paragraph(text([item.degree, item.field, item.institution, item.year].filter(Boolean).join(' — ')))));
  if (content.projects?.length) addSection('Projects', content.projects.flatMap((item) => [
    new Paragraph({ children: [new TextRun({ text: text(item.title), bold: true })] }),
    new Paragraph(text(item.description)),
  ]));
  const blob = await Packer.toBlob(new Document({ sections: [{ children }] }));
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${text(data.personalInfo.fullName) || 'resume'}.docx`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ResumeBuilderPage({ isDark }) {
  const navigate = useNavigate();
  const [data, setData] = useState(initialData);
  const [content, setContent] = useState(null);
  const [template, setTemplate] = useState('classic');
  const [resumeId, setResumeId] = useState(null);
  const [saved, setSaved] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSavedResumes().then(setSaved).catch(() => {});
  }, []);

  const update = (path, value) => {
    setData((current) => {
      const next = { ...current };
      let target = next;
      path.slice(0, -1).forEach((key) => { target[key] = { ...target[key] }; target = target[key]; });
      target[path[path.length - 1]] = value;
      return next;
    });
  };
  const updateArray = (section, index, field, value) => setData((current) => ({ ...current, [section]: current[section].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const addItem = (section, empty) => setData((current) => ({ ...current, [section]: [...current[section], { ...empty }] }));
  const removeItem = (section, index) => setData((current) => ({ ...current, [section]: current[section].filter((_, itemIndex) => itemIndex !== index) }));

  const generate = async (event) => {
    event.preventDefault();
    if (!data.personalInfo.fullName.trim()) { setError('Full name is required.'); setStep(0); return; }
    setLoading(true); setError('');
    try {
      const record = await generateResumeRequest(data, template);
      setContent(record.generatedContent);
      setResumeId(record._id);
      setSaved((current) => [record, ...current.filter((item) => item._id !== record._id)]);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const saveEdits = async () => {
    if (!resumeId) return;
    setLoading(true);
    try { await updateSavedResume(resumeId, { generatedContent: content, inputData: data, template }); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  const loadResume = (record) => { setData(record.inputData); setContent(record.generatedContent); setTemplate(record.template); setResumeId(record._id); };
  const removeResume = async (id) => { await deleteSavedResume(id); setSaved((current) => current.filter((item) => item._id !== id)); if (id === resumeId) { setResumeId(null); setContent(null); } };

  const panel = isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-indigo-100/50';
  const heading = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const input = `w-full rounded-xl border px-3 py-2.5 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`;
  const field = (label, path, placeholder = '') => <label className="block"><span className={`block text-sm font-medium mb-1.5 ${heading}`}>{label}</span><input className={input} value={path.reduce((value, key) => value?.[key] ?? '', data)} onChange={(event) => update(path, event.target.value)} placeholder={placeholder} /></label>;
  const textField = (label, path, placeholder = '') => <label className="block"><span className={`block text-sm font-medium mb-1.5 ${heading}`}>{label}</span><textarea className={input} rows={3} value={path.reduce((value, key) => value?.[key] ?? '', data)} onChange={(event) => update(path, event.target.value)} placeholder={placeholder} /></label>;

  return (
    <div className="max-w-7xl mx-auto animate-fade-slide-up">
      <button onClick={() => navigate('/')} className={`flex items-center gap-2 mb-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}><ArrowLeft className="w-4 h-4" /> Back to Analyze</button>
      <div className={`rounded-2xl shadow-xl border p-6 sm:p-8 ${panel}`}>
        <div className="flex items-start gap-4 mb-6"><div className="p-3 rounded-xl bg-purple-100 text-purple-600"><FileText className="w-6 h-6" /></div><div><h1 className={`text-2xl sm:text-3xl font-display font-bold ${heading}`}>Create My Resume</h1><p className={muted}>Build an editable, ATS-friendly resume without invented qualifications.</p></div></div>
        <div className="grid sm:grid-cols-7 gap-2 mb-8">{steps.map((label, index) => <button type="button" key={label} onClick={() => setStep(index)} className={`rounded-lg px-2 py-2 text-xs font-semibold ${index === step ? 'bg-indigo-600 text-white' : `${muted} bg-slate-100 dark:bg-slate-900`}`}>{index + 1}. {label}</button>)}</div>
        <form onSubmit={generate}>
          {step === 0 && <div className="grid sm:grid-cols-2 gap-4">{field('Full name *', ['personalInfo', 'fullName'], 'Alex Morgan')}{field('Professional email', ['personalInfo', 'email'], 'alex@example.com')}{field('Phone', ['personalInfo', 'phone'])}{field('City and location', ['personalInfo', 'location'])}{field('LinkedIn URL', ['personalInfo', 'linkedin'])}{field('GitHub or portfolio URL', ['personalInfo', 'portfolio'])}</div>}
          {step === 1 && <div className="grid sm:grid-cols-2 gap-4">{field('Target job role', ['targetRole'], 'Frontend Developer')}{field('Years of experience', ['yearsExperience'], '0')}{textField('Career objective or professional summary', ['summary'], 'What kind of work do you want to do?')}</div>}
          {step === 2 && <ArrayEditor title="Education" section="education" items={data.education} empty={emptyEducation} update={updateArray} add={addItem} remove={removeItem} input={input} heading={heading} muted={muted} fields={['institution', 'degree', 'field', 'year', 'achievements']} />}
          {step === 3 && <div className="grid sm:grid-cols-2 gap-4">{textField('Technical skills', ['technicalSkills'], 'Databases, cloud, testing')}{textField('Programming languages', ['programmingLanguages'], 'JavaScript, Python')}{textField('Frameworks and tools', ['frameworks'], 'React, Node.js, Git')}{textField('Soft skills', ['softSkills'], 'Communication, teamwork')}{textField('Certifications', ['certifications'], 'Certification name and issuer')}</div>}
          {step === 4 && <ArrayEditor title="Work experience (optional for freshers)" section="experience" items={data.experience} empty={emptyExperience} update={updateArray} add={addItem} remove={removeItem} input={input} heading={heading} muted={muted} fields={['title', 'company', 'dates', 'responsibilities', 'achievements']} />}
          {step === 5 && <ArrayEditor title="Projects" section="projects" items={data.projects} empty={emptyProject} update={updateArray} add={addItem} remove={removeItem} input={input} heading={heading} muted={muted} fields={['title', 'technologies', 'description', 'contributions', 'link']} />}
          {step === 6 && <div className="grid sm:grid-cols-2 gap-4">{textField('Internships', ['additional', 'internships'])}{textField('Languages known', ['additional', 'languages'])}{textField('Relevant achievements', ['additional', 'achievements'])}</div>}
          {error && <p role="alert" className="mt-4 text-sm text-rose-500">{error}</p>}
          <div className="flex flex-wrap justify-between gap-3 mt-7"><button type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)} className={`px-4 py-2 rounded-lg border ${muted} disabled:opacity-40`}>Previous</button><div className="flex gap-3">{step < steps.length - 1 && <button type="button" onClick={() => setStep((current) => current + 1)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Next</button>}{step === steps.length - 1 && <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold disabled:opacity-50">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Generate Resume with AI</button>}</div></div>
        </form>
      </div>
      {saved.length > 0 && <div className={`mt-6 rounded-2xl border p-5 ${panel}`}><h2 className={`font-semibold ${heading}`}>Saved resumes</h2><div className="flex flex-wrap gap-2 mt-3">{saved.map((record) => <div key={record._id} className="flex items-center gap-1"><button onClick={() => loadResume(record)} className="px-3 py-2 rounded-lg bg-indigo-100 text-indigo-700 text-sm">{record.title}</button><button onClick={() => removeResume(record._id)} aria-label={`Delete ${record.title}`} className="p-2 text-rose-500"><Trash2 className="w-4 h-4" /></button></div>)}</div></div>}
      {content && <ResumePreview content={content} setContent={setContent} data={data} template={template} setTemplate={setTemplate} saveEdits={saveEdits} loading={loading} isDark={isDark} panel={panel} heading={heading} muted={muted} />}
    </div>
  );
}

function ArrayEditor({ title, section, items, empty, update, add, remove, input, heading, muted, fields }) {
  return <div><div className="flex items-center justify-between mb-3"><h2 className={`font-semibold ${heading}`}>{title}</h2><button type="button" onClick={() => add(section, empty)} className="inline-flex items-center gap-1 text-sm text-indigo-500"><Plus className="w-4 h-4" /> Add</button></div>{items.map((item, index) => <div key={index} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-3 grid sm:grid-cols-2 gap-3"><div className="contents">{fields.map((field) => <label key={field} className="block"><span className={`text-xs capitalize ${muted}`}>{field}</span>{['responsibilities', 'achievements', 'description', 'contributions'].includes(field) ? <textarea rows={2} className={input} value={item[field] || ''} onChange={(event) => update(section, index, field, event.target.value)} /> : <input className={input} value={item[field] || ''} onChange={(event) => update(section, index, field, event.target.value)} />}</label>)}</div>{items.length > 1 && <button type="button" onClick={() => remove(section, index)} className="text-rose-500 text-sm">Remove</button>}</div>)}</div>;
}

function ResumePreview({ content, setContent, data, template, setTemplate, saveEdits, loading, isDark, panel, heading, muted }) {
  const update = (field, value) => setContent((current) => ({ ...current, [field]: value }));
  return <div id="resume-preview" className={`mt-6 rounded-2xl shadow-xl border p-6 sm:p-8 ${panel}`}><div className="flex flex-wrap items-center justify-between gap-3 mb-5 print:hidden"><h2 className={`text-xl font-bold ${heading}`}>Editable preview</h2><div className="flex flex-wrap gap-2"><select value={template} onChange={(event) => setTemplate(event.target.value)} className="rounded-lg border px-3 py-2"><option value="classic">Classic ATS-Friendly</option><option value="modern">Modern Professional</option><option value="minimal">Minimalist Fresher</option></select><button onClick={saveEdits} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm"><Save className="w-4 h-4" /> Save edits</button><button onClick={() => window.print()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm"><Download className="w-4 h-4" /> Download PDF</button><button onClick={() => downloadDocx(data, content)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 text-white text-sm"><Download className="w-4 h-4" /> Download DOCX</button></div></div><article className={`resume-paper ${template} max-w-3xl mx-auto p-6 sm:p-10 ${isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}`}><h1 className="text-3xl font-bold">{data.personalInfo.fullName}</h1><p className={`text-sm ${muted}`}>{[data.targetRole, data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean).join(' | ')}</p><textarea aria-label="Professional summary" className="w-full mt-5 bg-transparent border-0 p-0 resize-y" rows={3} value={content.summary || ''} onChange={(event) => update('summary', event.target.value)} /> <Section title="Skills"><input aria-label="Skills" className="w-full bg-transparent border-0 p-0" value={(content.skills || []).join(', ')} onChange={(event) => update('skills', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} /></Section><Section title="Experience">{(content.experience || []).map((item, index) => <div key={index} className="mb-4"><input className="w-full bg-transparent border-0 p-0 font-semibold" value={`${item.title || ''}${item.company ? ` — ${item.company}` : ''}`} onChange={(event) => update('experience', content.experience.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: event.target.value } : entry))} /><p className="text-sm">{item.dates}</p><ul className="list-disc pl-5">{(item.bullets || []).map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div>)}</Section><Section title="Education">{(content.education || []).map((item) => <p key={`${item.institution}-${item.degree}`}>{[item.degree, item.field, item.institution, item.year].filter(Boolean).join(' — ')}</p>)}</Section><Section title="Projects">{(content.projects || []).map((item) => <div key={item.title}><strong>{item.title}</strong><p>{item.description}</p></div>)}</Section></article></div>;
}
function Section({ title, children }) { return <section className="mt-5"><h2 className="border-b border-slate-300 pb-1 mb-2 text-lg font-bold">{title}</h2>{children}</section>; }
