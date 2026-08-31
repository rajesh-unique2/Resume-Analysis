# Resume Analyzer — Frontend

React (Vite) + Tailwind CSS frontend for the AI-based Resume Analysis
System. Talks to an Express backend powered by Gemini AI.

## Setup

```bash
npm install
npm run dev
```

Runs at http://localhost:5173. Make sure the backend is running at
http://localhost:5000 (see the backend README).

## Features

- **Analyze** — upload a resume + one or more job descriptions (comma
  separated), get a match score, matched/missing skills, and AI feedback
  per job. If one job fails (e.g. a temporary AI overload), the others
  still complete — failures are shown clearly, not silently dropped.
- **ATS Check** — upload a resume alone and get an ATS-friendliness score,
  an animated formatting checklist, and AI-suggested rewrites for weak
  bullet points.
- **History** — past analyses saved to MongoDB, with job description and
  a color-coded score badge. Responsive: table on desktop, stacked cards
  on mobile.

## Design

- **Styling:** Tailwind CSS only (see `tailwind.config.js` for the color
  tokens and animation keyframes) — no plain CSS files.
- **Color scheme:** dark ink header/footer (`#111827`), indigo accent
  (`#4F46E5`), with emerald/amber/rose used consistently for
  strong/moderate/weak scores across every page.
- **Loading state:** `ScanLoader.jsx` — a document-scan animation shown
  whenever an AI call is in flight (analyze, ATS check, history load).
- **Motion:** staggered fade-ins, hover lifts, a count-up score animation,
  and a drawn checkmark/X in the ATS checklist. `prefers-reduced-motion`
  is respected globally (see `src/index.css`).
- **Responsive:** every page adapts from mobile to desktop — nav wraps,
  grids collapse to a single column, and the History table becomes
  stacked cards below the `sm` breakpoint.

## Structure

```
src/
  components/
    UploadForm.jsx        - resume file + job description input
    ScanLoader.jsx          - animated loading indicator (document scan)
    ScoreGauge.jsx           - radial match-score chart (recharts)
    ScoreBadge.jsx            - small pill score badge (history table)
    CountUpScore.jsx           - animated count-up score number
    SkillTag.jsx                 - matched/missing skill chip
    FeedbackCard.jsx               - AI-generated feedback text
    ChecklistItem.jsx                - animated ATS checklist row
    BulletRewriteCard.jsx             - before/after bullet rewrite card
  pages/
    UploadPage.jsx           - manages upload + multi-job analysis state
    ResultsPage.jsx            - renders score, skills, feedback (per job)
    ATSCheckPage.jsx             - ATS check upload + results
    HistoryPage.jsx                - past analyses from MongoDB
  services/
    api.js                          - axios calls to the backend
  utils/
    scoreColor.js                     - shared score -> color mapping
  App.jsx                               - routes + layout
  index.css                               - Tailwind entry + reduced-motion rule
tailwind.config.js                          - color tokens + animation keyframes
```

## Expected backend endpoints

- `POST /api/analyze` — multipart form: `resume` (PDF), `jobDescription`
  (text, one job). Returns `{ score, matchedSkills, missingSkills, feedback }`.
- `POST /api/ats-check` — multipart form: `resume` (PDF) only. Returns
  `{ atsScore, checks, rewrittenBullets }`.
- `GET /api/history` — array of past analyses (`fileName`,
  `jobDescription`, `score`, `createdAt`).
