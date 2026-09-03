import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
const FALLBACK_MODELS = [MODEL_NAME, 'gemini-flash-latest', 'gemini-3.5-flash']

const REQUEST_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 20000)
const MAX_RETRIES_PER_MODEL = 2 // total 3 attempts per model before falling back
const BASE_BACKOFF_MS = 800

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Races a Gemini call against a timeout so a slow/hung request can't
 * block a whole batch indefinitely.
 */
function withTimeout(promise, ms) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`Gemini request timed out after ${ms}ms`)
      err.status = 408
      reject(err)
    }, ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

/**
 * Calls Gemini with:
 *  - a per-request timeout (so one slow call can't hang the process)
 *  - short retry/backoff on 429s for the SAME model first (usually
 *    recovers fast and keeps you on your best model)
 *  - fallback to the next model in FALLBACK_MODELS if a model keeps
 *    failing with a retryable status (429/500/503)
 */
async function generateContent(prompt) {
  let lastError

  for (const modelName of [...new Set(FALLBACK_MODELS)]) {
    const model = genAI.getGenerativeModel({ model: modelName })

    for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        return await withTimeout(model.generateContent(prompt), REQUEST_TIMEOUT_MS)
      } catch (error) {
        lastError = error
        const retryable = [429, 408, 500, 503].includes(error.status)

        if (!retryable) throw error

        const isLastAttemptForModel = attempt === MAX_RETRIES_PER_MODEL
        if (!isLastAttemptForModel) {
          // exponential backoff before retrying the same model
          await sleep(BASE_BACKOFF_MS * 2 ** attempt)
          continue
        }
        // fall through to the next model in FALLBACK_MODELS
      }
    }
  }

  throw lastError
}

/**
 * Strips markdown code fences Gemini sometimes adds around JSON output
 * despite being asked not to, then parses it.
 * @param {string} rawText
 * @returns {object}
 */
function parseJsonResponse(rawText) {
  const cleaned = rawText.replace(/^```json\s*|^```\s*|```$/gm, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch (err) {
    throw new Error(`Gemini returned unparseable output: ${cleaned.slice(0, 200)}`)
  }
}

/**
 * Sends the resume and job description to Gemini in a single call, and
 * asks it to return a structured JSON result: match score, matched
 * skills, missing skills, and written feedback - all in one pass.
 *
 * @param {object} params
 * @param {string} params.resumeText
 * @param {string} params.jobDescription
 * @returns {Promise<{score: number, matchedSkills: string[], missingSkills: string[], feedback: string}>}
 */
export async function analyzeResumeWithGemini({ resumeText, jobDescription }) {
  const prompt = `You are a resume screening assistant. Compare the resume below
against the job description and evaluate the match.

Resume text:
${resumeText.slice(0, 6000)}

Job description:
${jobDescription.slice(0, 3000)}

Respond with ONLY a valid JSON object (no markdown, no code fences, no
extra text) in exactly this shape:
{
  "score": <integer 0-100, how well the resume matches the job description>,
  "matchedSkills": [<short skill/requirement names the resume DOES satisfy, max 15>],
  "missingSkills": [<short skill/requirement names the job needs but the resume DOESN'T show, max 15>],
  "feedback": "<3-5 sentences of specific, actionable feedback for the candidate. Mention the most important gaps and one genuine strength. Plain text only.>"
}`

  const result = await generateContent(prompt)
  const parsed = parseJsonResponse(result.response.text().trim())

  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score ?? 0))),
    matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    feedback: parsed.feedback || 'No feedback generated.',
  }
}

/**
 * Sends the resume text to Gemini and asks it to (1) run a checklist of
 * common ATS formatting/content checks, and (2) suggest improved
 * rewrites for the weakest bullet points found.
 *
 * @param {string} resumeText
 * @returns {Promise<{
 *   atsScore: number,
 *   checks: {label: string, passed: boolean, note: string}[],
 *   rewrittenBullets: {original: string, improved: string}[]
 * }>}
 */
export async function analyzeATSAndRewrite(resumeText) {
  const prompt = `You are an ATS (Applicant Tracking System) resume auditor
and career coach. Review the resume text below.

Resume text:
${resumeText.slice(0, 6000)}

Respond with ONLY a valid JSON object (no markdown, no code fences, no
extra text) in exactly this shape:
{
  "atsScore": <integer 0-100, overall ATS-friendliness>,
  "checks": [
    {"label": "Contact information present", "passed": true, "note": "<one short sentence>"},
    {"label": "Standard section headings", "passed": true, "note": "<one short sentence>"},
    {"label": "No tables or columns that break parsing", "passed": true, "note": "<one short sentence>"},
    {"label": "Consistent date formatting", "passed": true, "note": "<one short sentence>"},
    {"label": "Quantified achievements (numbers/metrics)", "passed": true, "note": "<one short sentence>"},
    {"label": "Action verbs used consistently", "passed": true, "note": "<one short sentence>"}
  ],
  "rewrittenBullets": [
    {"original": "<a weak bullet point copied from the resume, max 3 of these>", "improved": "<a stronger rewritten version using an action verb and, where possible, a quantified result>"}
  ]
}

Only include rewrittenBullets for genuinely weak bullets (vague, no verb,
no impact shown). If all bullets are already strong, return an empty array
for rewrittenBullets. Keep every "note" and bullet under 20 words.`

  const result = await generateContent(prompt)
  const parsed = parseJsonResponse(result.response.text().trim())

  return {
    atsScore: Math.max(0, Math.min(100, Math.round(parsed.atsScore ?? 0))),
    checks: Array.isArray(parsed.checks) ? parsed.checks : [],
    rewrittenBullets: Array.isArray(parsed.rewrittenBullets) ? parsed.rewrittenBullets : [],
  }
}