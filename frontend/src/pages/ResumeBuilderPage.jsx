import { useEffect, useState } from 'react';
import { ArrowLeft, Download, FileText, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteSavedResume, generateResumeRequest, getSavedResumes, updateSavedResume } from '../services/api';
import { Document, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } from 'docx';

const emptyEducation = { institution: '', degree: '', field: '', year: '', achievements: '' };
const emptyExperience = { title: '', company: '', dates: '', responsibilities: '', achievements: '' };
const emptyProject = { title: '', technologies: '', description: '', contributions: '', link: '' };
const initialData = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', portfolio: '', profileImage: '' },
  summary: '', targetRole: '', yearsExperience: '', education: [{ ...emptyEducation }],
  technicalSkills: '', programmingLanguages: '', frameworks: '', softSkills: '', certifications: '',
  experience: [{ ...emptyExperience }], projects: [{ ...emptyProject }],
  additional: { internships: '', languages: '', achievements: '' },
};

const steps = ['Personal', 'Summary', 'Education', 'Skills', 'Experience', 'Projects', 'Additional'];

async function downloadDocx(data, content) {
  const text = (value) => String(value || '').trim();
  const paperColor = '1C2928';
  const accentColor = '607D3B';
  const imageSource = data.personalInfo.profileImage?.split(',')[1];
  const imageBuffer = imageSource
    ? Uint8Array.from(atob(imageSource), (character) => character.charCodeAt(0))
    : null;
  const run = (value, options = {}) => new TextRun({ text: text(value), color: paperColor, ...options });
  const paragraph = (value, options = {}) => new Paragraph({ children: [run(value)], ...options });
  const children = [
    new Paragraph({
      children: [
        ...(imageBuffer ? [new ImageRun({ data: imageBuffer, transformation: { width: 86, height: 86 } })] : []),
        run(data.personalInfo.fullName, { bold: true, size: 34 }),
      ],
      heading: HeadingLevel.TITLE,
    }),
    paragraph([data.targetRole, data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean).join(' | ')),
  ];
  const addSection = (title, items) => {
    if (!items.length) return;
    children.push(new Paragraph({ children: [run(title, { bold: true, color: accentColor })], heading: HeadingLevel.HEADING_1 }));
    children.push(...items);
  };
  if (text(content.summary)) addSection('Summary', [paragraph(content.summary)]);
  if (content.skills?.length) addSection('Skills', [paragraph(content.skills.join(', '))]);
  if (content.experience?.length) {
    addSection('Experience', content.experience.flatMap((item) => [
      new Paragraph({ children: [run(`${text(item.title)}${item.company ? ` — ${text(item.company)}` : ''}`, { bold: true })] }),
      paragraph(item.dates),
      ...(item.bullets || []).map((bullet) => new Paragraph({ children: [run(bullet)], bullet: { level: 0 } })),
    ]));
  }
  if (content.education?.length) addSection('Education', content.education.map((item) => paragraph([item.degree, item.field, item.institution, item.year].filter(Boolean).join(' — '))));
  if (content.projects?.length) addSection('Projects', content.projects.flatMap((item) => [
    new Paragraph({ children: [run(item.title, { bold: true })] }),
    paragraph(item.description),
  ]));
  const blob = await Packer.toBlob(new Document({ styles: { default: { document: { run: { color: paperColor } } } }, sections: [{ children }] }));
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${text(data.personalInfo.fullName) || 'resume'}.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadPdf(data) {
  const previousTitle = document.title;
  const fileName = String(data.personalInfo.fullName || 'resume').trim();
  const restoreTitle = () => {
    document.title = previousTitle;
    window.removeEventListener('afterprint', restoreTitle);
  };
  document.title = fileName;
  window.addEventListener('afterprint', restoreTitle, { once: true });
  window.print();
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
  const [imageError, setImageError] = useState('');

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
  const handleImageChange = (event) => {
    const image = event.target.files?.[0];
    if (!image) return;
    if (!image.type.startsWith('image/')) {
      setImageError('Please choose a JPG, PNG, or WEBP image.');
      return;
    }
    if (image.size > 2 * 1024 * 1024) {
      setImageError('Profile image must be smaller than 2MB.');
      return;
    }
    setImageError('');
    const reader = new FileReader();
    reader.onload = () => update(['personalInfo', 'profileImage'], reader.result);
    reader.readAsDataURL(image);
  };

  return (
    <div className="resume-builder-page max-w-7xl mx-auto animate-fade-slide-up">
      <button onClick={() => navigate('/')} className={`flex items-center gap-2 mb-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}><ArrowLeft className="w-4 h-4" /> Back to Analyze</button>
      <div className={`rounded-2xl shadow-xl border p-6 sm:p-8 ${panel}`}>
        <div className="flex items-start gap-4 mb-6"><div className="p-3 rounded-xl bg-purple-100 text-purple-600"><FileText className="w-6 h-6" /></div><div><h1 className={`text-2xl sm:text-3xl font-display font-bold ${heading}`}>Create My Resume</h1><p className={muted}>Build an editable, ATS-friendly resume without invented qualifications.</p></div></div>
        <div className="grid sm:grid-cols-7 gap-2 mb-8">{steps.map((label, index) => <button type="button" key={label} onClick={() => setStep(index)} className={`rounded-lg px-2 py-2 text-xs font-semibold ${index === step ? 'bg-indigo-600 text-white' : `${muted} bg-slate-100 dark:bg-slate-900`}`}>{index + 1}. {label}</button>)}</div>
        <form onSubmit={generate}>
          {step === 0 && <div className="grid sm:grid-cols-2 gap-4"><div className="sm:col-span-2 flex flex-wrap items-center gap-4 rounded-xl border border-dashed p-4"><div className="profile-image-picker">{data.personalInfo.profileImage ? <img src={data.personalInfo.profileImage} alt="Profile preview" /> : <FileText className="w-6 h-6" />}</div><div className="flex-1 min-w-[180px]"><label className={`block text-sm font-medium mb-1.5 ${heading}`}>Profile image <span className={muted}>(optional)</span></label><input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} className={input} /><p className={`text-xs mt-1 ${muted}`}>Use a clear square image, up to 2MB. It will appear in the preview and DOCX export.</p>{imageError && <p className="text-xs text-rose-400 mt-1">{imageError}</p>}</div>{data.personalInfo.profileImage && <button type="button" onClick={() => update(['personalInfo', 'profileImage'], '')} className="text-sm text-rose-400">Remove</button>}</div>{field('Full name *', ['personalInfo', 'fullName'], 'Alex Morgan')}{field('Professional email', ['personalInfo', 'email'], 'alex@example.com')}{field('Phone', ['personalInfo', 'phone'])}{field('City and location', ['personalInfo', 'location'])}{field('LinkedIn URL', ['personalInfo', 'linkedin'])}{field('GitHub or portfolio URL', ['personalInfo', 'portfolio'])}</div>}
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
      {content && <ResumePreview content={content} setContent={setContent} data={data} template={template} setTemplate={setTemplate} saveEdits={saveEdits} loading={loading} setError={setError} isDark={isDark} panel={panel} heading={heading} muted={muted} />}
    </div>
  );
}

function ArrayEditor({ title, section, items, empty, update, add, remove, input, heading, muted, fields }) {
  return <div><div className="flex items-center justify-between mb-3"><h2 className={`font-semibold ${heading}`}>{title}</h2><button type="button" onClick={() => add(section, empty)} className="inline-flex items-center gap-1 text-sm text-indigo-500"><Plus className="w-4 h-4" /> Add</button></div>{items.map((item, index) => <div key={index} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-3 grid sm:grid-cols-2 gap-3"><div className="contents">{fields.map((field) => <label key={field} className="block"><span className={`text-xs capitalize ${muted}`}>{field}</span>{['responsibilities', 'achievements', 'description', 'contributions'].includes(field) ? <textarea rows={2} className={input} value={item[field] || ''} onChange={(event) => update(section, index, field, event.target.value)} /> : <input className={input} value={item[field] || ''} onChange={(event) => update(section, index, field, event.target.value)} />}</label>)}</div>{items.length > 1 && <button type="button" onClick={() => remove(section, index)} className="text-rose-500 text-sm">Remove</button>}</div>)}</div>;
}

function ResumePreview({ content, setContent, data, template, setTemplate, saveEdits, loading, setError, isDark, panel, heading, muted }) {
  const update = (field, value) => setContent((current) => ({ ...current, [field]: value }));
  const downloadWord = async () => {
    try {
      setError('');
      await downloadDocx(data, content);
    } catch (error) {
      console.error('DOCX download failed:', error);
      setError('DOCX download failed. Please try again.');
    }
  };
  return <div id="resume-preview" className={`mt-6 rounded-2xl shadow-xl border p-6 sm:p-8 ${panel}`}><div className="flex flex-wrap items-center justify-between gap-3 mb-5 print:hidden"><h2 className={`text-xl font-bold ${heading}`}>Editable preview</h2><div className="flex flex-wrap gap-2"><select value={template} onChange={(event) => setTemplate(event.target.value)} className="rounded-lg border px-3 py-2"><option value="classic">Classic ATS-Friendly</option><option value="modern">Modern Professional</option><option value="minimal">Minimalist Fresher</option></select><button onClick={saveEdits} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm"><Save className="w-4 h-4" /> Save edits</button><button onClick={() => downloadPdf(data)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm"><Download className="w-4 h-4" /> Download PDF</button><button onClick={downloadWord} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 text-white text-sm"><Download className="w-4 h-4" /> Download DOCX</button></div></div><article className={`resume-paper ${template} max-w-3xl mx-auto p-6 sm:p-10`}><header className="resume-header"><div><h1 className="text-3xl font-bold">{data.personalInfo.fullName}</h1><p className="text-base font-medium">{data.targetRole}</p><p className="text-sm resume-contact">{[data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean).join(' | ')}</p></div>{data.personalInfo.profileImage && <img className="resume-profile-image" src={data.personalInfo.profileImage} alt="" />}</header><textarea aria-label="Professional summary" className="w-full mt-5 bg-transparent border-0 p-0 resize-y" rows={3} value={content.summary || ''} onChange={(event) => update('summary', event.target.value)} /> <Section title="Skills"><input aria-label="Skills" className="w-full bg-transparent border-0 p-0" value={(content.skills || []).join(', ')} onChange={(event) => update('skills', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} /></Section><Section title="Experience">{(content.experience || []).map((item, index) => <div key={index} className="mb-4"><input className="w-full bg-transparent border-0 p-0 font-semibold" value={`${item.title || ''}${item.company ? ` — ${item.company}` : ''}`} onChange={(event) => update('experience', content.experience.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: event.target.value } : entry))} /><p className="text-sm">{item.dates}</p><ul className="list-disc pl-5">{(item.bullets || []).map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div>)}</Section><Section title="Education">{(content.education || []).map((item) => <p key={`${item.institution}-${item.degree}`}>{[item.degree, item.field, item.institution, item.year].filter(Boolean).join(' — ')}</p>)}</Section><Section title="Projects">{(content.projects || []).map((item) => <div key={item.title}><strong>{item.title}</strong><p>{item.description}</p></div>)}</Section></article></div>;
}
function Section({ title, children }) { return <section className="mt-5"><h2 className="border-b border-slate-300 pb-1 mb-2 text-lg font-bold">{title}</h2>{children}</section>; }
