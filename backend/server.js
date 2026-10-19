import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Setup Multer for audio uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Placeholder function to compute a communication score
function computeScore(transcript) {
  // Very naive scoring: longer transcript => higher score, filler words reduce score.
  const fillerWords = ['um', 'uh', 'like', 'you know'];
  const words = transcript.split(/\s+/).filter(Boolean);
  const fillerCount = words.filter(w => fillerWords.includes(w.toLowerCase())).length;
  const baseScore = Math.min(100, (words.length * 0.5) - (fillerCount * 5));
  return Math.max(0, Math.round(baseScore));
}

// Mock transcription – in real implementation you'd call Whisper or another ASR service.
async function transcribeAudio(buffer) {
  // For demo, just return a fixed string.
  return 'This is a sample transcription of the uploaded audio file.';
}

// Voice scoring endpoint
app.post('/api/voice-score', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file missing' });
    }
    const transcript = await transcribeAudio(req.file.buffer);
    const score = computeScore(transcript);
    res.json({ transcript, score });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resume generation endpoint – returns markdown (could be extended to PDF)
app.post('/api/resume-generate', (req, res) => {
  const data = req.body; // Expect JSON with sections
  const { personalInfo, summary, experience = [], education = [], skills = [], projects = [], certifications = [] } = data;

  const lines = [];
  if (personalInfo) {
    lines.push(`# ${personalInfo.name}`);
    if (personalInfo.title) lines.push(`**${personalInfo.title}**`);
    if (personalInfo.email) lines.push(`Email: ${personalInfo.email}`);
    if (personalInfo.phone) lines.push(`Phone: ${personalInfo.phone}`);
    lines.push('---');
  }
  if (summary) lines.push(`## Summary\n${summary}\n`);
  if (experience.length) {
    lines.push('## Experience');
    experience.forEach((job) => {
      lines.push(`### ${job.role} @ ${job.company}`);
      lines.push(`${job.start} - ${job.end || 'Present'}`);
      if (job.description) lines.push(job.description);
    });
  }
  if (education.length) {
    lines.push('## Education');
    education.forEach((ed) => {
      lines.push(`### ${ed.degree} - ${ed.institution}`);
      lines.push(`${ed.start} - ${ed.end}`);
    });
  }
  if (skills.length) {
    lines.push('## Skills');
    lines.push(skills.join(', '));
  }
  if (projects.length) {
    lines.push('## Projects');
    projects.forEach((p) => {
      lines.push(`### ${p.name}`);
      if (p.link) lines.push(`Link: ${p.link}`);
      if (p.description) lines.push(p.description);
    });
  }
  if (certifications.length) {
    lines.push('## Certifications');
    certifications.forEach((c) => lines.push(`- ${c}`));
  }

  const markdown = lines.join('\n');
  res.json({ markdown });
});

// Serve static frontend for convenience (if built)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
