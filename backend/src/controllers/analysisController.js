import Analysis from '../models/Analysis.js'
import { extractTextFromResume } from '../services/pdfService.js'
import { analyzeResumeWithGemini } from '../services/geminiService.js'

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
