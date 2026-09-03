import Analysis from '../models/Analysis.js'
import { extractTextFromResume } from '../services/pdfService.js'
import { analyzeResumeWithGemini } from '../services/geminiService.js'
import { runWithConcurrency } from '../utils/concurrency.js'

/**
 * POST /api/analyze
 * Expects multipart/form-data: resume (PDF file), jobDescription (text)
 */
export async function analyzeResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded.' })
    }
    const { jobDescription } = req.body
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ message: 'Job description is required.' })
    }

    // 1. Extract raw text from the PDF (local, no API call)
    const resumeText = await extractTextFromResume(req.file.buffer)
    if (!resumeText.trim()) {
      return res.status(422).json({
        message: 'Could not extract any text from this PDF. Try a different file.',
      })
    }

    // 2. Send resume + job description to Gemini for scoring AND feedback
    // in one call. If Gemini is unavailable (rate limit, 503, bad key),
    // fail honestly rather than showing a fake/neutral score - the score
    // now genuinely depends on the AI call succeeding.
    let score, matchedSkills, missingSkills, feedback
    try {
      const result = await analyzeResumeWithGemini({ resumeText, jobDescription })
      score = result.score
      matchedSkills = result.matchedSkills
      missingSkills = result.missingSkills
      feedback = result.feedback
    } catch (geminiErr) {
      console.error('Gemini analysis failed:', geminiErr.message)
      return res.status(503).json({
        message:
          'AI analysis is temporarily unavailable (Gemini may be at capacity). Please try again in a moment.',
      })
    }

    // 3. Save the result to MongoDB
    const record = await Analysis.create({
      fileName: req.file.originalname,
      jobDescription,
      resumeText,
      score,
      matchedSkills,
      missingSkills,
      feedback,
    })

    res.json({
      id: record._id,
      score,
      matchedSkills,
      missingSkills,
      feedback,
    })
  } catch (err) {
    console.error('Analyze error:', err)
    res.status(500).json({
      message: 'Something went wrong while analyzing the resume. Please try again.',
    })
  }
}

/**
 * POST /api/analyze-batch
 * Expects multipart/form-data: resume (PDF file),
 * jobDescriptions (JSON-stringified array of job description strings)
 *
 * Extracts the resume text ONCE, then analyzes it against every job
 * description with a small pool of concurrent Gemini calls, streaming
 * each result back over Server-Sent Events (SSE) the moment it's
 * ready - instead of forcing the client to wait for the whole batch,
 * and instead of the caller looping /api/analyze once per job (which
 * re-uploads/re-parses the PDF every time and has no concurrency
 * control, which is what causes both the slowness and the 429
 * failures you were seeing).
 *
 * Frontend usage note: EventSource can't send file uploads, so consume
 * this with `fetch()` + a streaming reader, parsing SSE frames
 * ("event: ...\ndata: ...\n\n") off the response body as they arrive.
 */
export async function analyzeResumeBatch(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded.' })
    }

    let jobDescriptions
    try {
      jobDescriptions = JSON.parse(req.body.jobDescriptions || '[]')
    } catch {
      return res.status(400).json({ message: 'jobDescriptions must be a JSON array of strings.' })
    }
    if (!Array.isArray(jobDescriptions)) {
      return res.status(400).json({ message: 'jobDescriptions must be a JSON array of strings.' })
    }
    jobDescriptions = jobDescriptions.filter((jd) => typeof jd === 'string' && jd.trim())
    if (jobDescriptions.length === 0) {
      return res.status(400).json({ message: 'Provide at least one non-empty job description.' })
    }

    // Extract resume text ONCE and reuse it for every job description.
    const resumeText = await extractTextFromResume(req.file.buffer)
    if (!resumeText.trim()) {
      return res.status(422).json({
        message: 'Could not extract any text from this PDF. Try a different file.',
      })
    }

    // --- Server-Sent Events setup ---
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // stop reverse proxies (nginx) from buffering the stream
    })
    res.flushHeaders?.()

    const send = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    }

    send('start', { total: jobDescriptions.length, fileName: req.file.originalname })

    // Keep concurrency modest - this is what avoids tripping Gemini's
    // rate limit when several jobs are analyzed back to back. Tune via
    // env var if your API quota allows more.
    const CONCURRENCY = Number(process.env.GEMINI_BATCH_CONCURRENCY || 2)

    await runWithConcurrency(
      jobDescriptions,
      async (jobDescription) => {
        const result = await analyzeResumeWithGemini({ resumeText, jobDescription })
        const record = await Analysis.create({
          fileName: req.file.originalname,
          jobDescription,
          resumeText,
          score: result.score,
          matchedSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
          feedback: result.feedback,
        })
        return { id: record._id, jobDescription, ...result }
      },
      ({ index, status, value, error }) => {
        if (status === 'fulfilled') {
          // A single job is ready - push it to the client immediately.
          send('result', { index, ...value })
        } else {
          console.error(`Batch analyze failed for job #${index}:`, error?.message)
          send('error', {
            index,
            jobDescription: jobDescriptions[index],
            message: 'AI analysis failed for this job (rate limited or unavailable). You can retry it individually.',
          })
        }
      },
      CONCURRENCY
    )

    send('done', {})
    res.end()
  } catch (err) {
    console.error('Batch analyze error:', err)
    if (res.headersSent) {
      res.write(
        `event: error\ndata: ${JSON.stringify({
          message: 'Something went wrong during batch analysis.',
        })}\n\n`
      )
      res.end()
    } else {
      res.status(500).json({ message: 'Something went wrong while analyzing the resume.' })
    }
  }
}

/**
 * GET /api/history
 */
export async function getHistory(req, res) {
  try {
    const records = await Analysis.find()
      .select('fileName jobDescription score createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(records)
  } catch (err) {
    console.error('History fetch error:', err)
    res.status(500).json({ message: 'Could not load history.' })
  }
}

/**
 * GET /api/history/:id
 */
export async function getAnalysisById(req, res) {
  try {
    const record = await Analysis.findById(req.params.id)
    if (!record) {
      return res.status(404).json({ message: 'Analysis not found.' })
    }
    res.json(record)
  } catch (err) {
    console.error('Fetch by id error:', err)
    res.status(500).json({ message: 'Could not load this analysis.' })
  }
}

/**
 * DELETE /api/history/:id
 */
export async function deleteHistory(req, res) {
  try {
    const record = await Analysis.findByIdAndDelete(req.params.id)
    if (!record) {
      return res.status(404).json({ message: 'Analysis not found.' })
    }
    res.json({ message: 'Deleted successfully', id: req.params.id })
  } catch (err) {
    console.error('Delete history error:', err)
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid analysis id.' })
    }
    res.status(500).json({ message: 'Could not delete this analysis.' })
  }
}