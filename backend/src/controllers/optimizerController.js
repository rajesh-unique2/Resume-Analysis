import { extractTextFromResume } from '../services/pdfService.js'
import { optimizeResumeForJob } from '../services/geminiService.js'

export async function optimize(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No resume file uploaded.' })
    if (!req.body.jobDescription?.trim()) return res.status(400).json({ message: 'Job description is required.' })
    const resumeText = await extractTextFromResume(req.file.buffer)
    if (!resumeText.trim()) return res.status(422).json({ message: 'Could not extract any text from this PDF.' })
    res.json(await optimizeResumeForJob({ resumeText, jobDescription: req.body.jobDescription }))
  } catch (error) {
    console.error('Optimizer error:', error.message)
    res.status(503).json({ message: 'The resume optimizer is temporarily unavailable. Please try again.' })
  }
}
