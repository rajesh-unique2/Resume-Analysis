import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

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
 * This replaces the old local skills-dictionary approach. It's slower
 * and depends on Gemini being available, but it's far more accurate:
 * it isn't limited to a fixed keyword list, so it works for any job
 * domain (MERN, data analytics, healthcare, etc.) without needing the
 * dictionary updated by hand.
 *
 * @param {object} params
 * @param {string} params.resumeText
 * @param {string} params.jobDescription
 * @returns {Promise<{score: number, matchedSkills: string[], missingSkills: string[], feedback: string}>}
 */
export async function analyzeResumeWithGemini({ resumeText, jobDescription }) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

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

  const result = await model.generateContent(prompt)
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
 * common ATS (Applicant Tracking System) formatting/content checks, and
 * (2) suggest improved rewrites for the weakest bullet points found.
 *
 * This is independent of any job description - it evaluates the resume
 * on its own merits (formatting, structure, clarity), not against a
 * specific role.
 *
 * @param {string} resumeText
 * @returns {Promise<{
 *   atsScore: number,
 *   checks: {label: string, passed: boolean, note: string}[],
 *   rewrittenBullets: {original: string, improved: string}[]
 * }>}
 */
export async function analyzeATSAndRewrite(resumeText) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

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

  const result = await model.generateContent(prompt)
  const parsed = parseJsonResponse(result.response.text().trim())

  return {
    atsScore: Math.max(0, Math.min(100, Math.round(parsed.atsScore ?? 0))),
    checks: Array.isArray(parsed.checks) ? parsed.checks : [],
    rewrittenBullets: Array.isArray(parsed.rewrittenBullets) ? parsed.rewrittenBullets : [],
  }
}
