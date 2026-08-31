import { extractTextFromResume } from '../services/pdfService.js'
import { analyzeATSAndRewrite } from '../services/geminiService.js'

/**
 * POST /api/ats-check
 * Expects multipart/form-data: resume (PDF file)
 * No job description needed - evaluates the resume's own formatting and
 * bullet-point quality, independent of any specific role.
 */
export async function checkATS(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded.' })
    }

    const resumeText = await extractTextFromResume(req.file.buffer)
    if (!resumeText.trim()) {
      return res.status(422).json({
        message: 'Could not extract any text from this PDF. Try a different file.',
      })
    }

    const { atsScore, checks, rewrittenBullets } = await analyzeATSAndRewrite(resumeText)

    res.json({ atsScore, checks, rewrittenBullets })
  } catch (err) {
    console.error('ATS check error:', err)
    if (err.message?.includes('unparseable') || err.status === 503) {
      return res.status(503).json({
        message: 'AI analysis is temporarily unavailable. Please try again in a moment.',
      })
    }
    res.status(500).json({
      message: 'Something went wrong while checking this resume. Please try again.',
    })
  }
}
