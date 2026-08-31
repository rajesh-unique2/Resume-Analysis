# Resume Analyzer — Backend

Express + MongoDB backend for the AI-based Resume Analysis System.
Needs **no AWS account** — uses `pdf-parse` (local) for PDF text
extraction and the **Gemini API** for both scoring and feedback.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the env template and fill in your real values:
   ```bash
   cp .env.example .env
   ```
   - `MONGODB_URI` — already correct for a local MongoDB install
   - `GEMINI_API_KEY` — from https://aistudio.google.com/apikey (keep this
     private — only in your local `.env`, never shared or committed)
   - `GEMINI_MODEL` — defaults to `gemini-3.6-flash` (a stable, current
     model; avoid brand-new releases if you hit repeated `503` errors)

3. Make sure local MongoDB is running:
   ```bash
   mongod
   ```

4. Start the server:
   ```bash
   npm run dev
   ```
   Runs on http://localhost:5000. Visit http://localhost:5000/api/health —
   you should see `{"status":"ok"}`.

## Endpoints

### `POST /api/analyze`
multipart/form-data: `resume` (PDF file), `jobDescription` (string, one job)

Sends the resume + job description to Gemini in a single call and returns:
```json
{
  "score": 78,
  "matchedSkills": ["react", "node.js", "mongodb"],
  "missingSkills": ["docker", "aws"],
  "feedback": "Your resume shows strong React and Node experience..."
}
```
If Gemini fails (rate limit, temporary `503`, bad key), this returns a
**503 with a clear message** rather than a fake score — the frontend
handles this per-job so one failure doesn't block the rest of a batch.

### `POST /api/ats-check`
multipart/form-data: `resume` (PDF file) — no job description needed.

Runs a formatting/content checklist and suggests rewrites for weak bullet
points:
```json
{
  "atsScore": 72,
  "checks": [
    { "label": "Contact information present", "passed": true, "note": "..." }
  ],
  "rewrittenBullets": [
    { "original": "...", "improved": "..." }
  ]
}
```

### `GET /api/history`
Last 50 analyses: `_id`, `fileName`, `jobDescription`, `score`, `createdAt`.

### `GET /api/history/:id`
Full saved record for one analysis.

## Structure

```
src/
  config/
    db.js                    - MongoDB connection
  middleware/
    upload.js                  - multer config (PDF only, 5MB limit)
  models/
    Analysis.js                 - Mongoose schema for saved analyses
  services/
    pdfService.js                 - PDF -> raw text (local, pdf-parse)
    geminiService.js               - Gemini calls: match scoring + ATS check
  controllers/
    analysisController.js            - /analyze, /history pipeline
    atsController.js                   - /ats-check pipeline
  routes/
    analysisRoutes.js                    - all route definitions
  server.js                                - app entry point
```

## Notes

- No AWS dependency anywhere — safe to run without a credit card or cloud
  account, just a free Gemini API key.
- Scoring is done entirely by Gemini reading both texts directly (no local
  keyword dictionary), so it works for any job domain without manual
  keyword maintenance.
- Keep `GEMINI_API_KEY` in `.env` only — never commit it or paste it
  anywhere outside your local machine.
