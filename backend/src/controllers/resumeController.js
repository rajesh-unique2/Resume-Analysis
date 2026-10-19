import Resume from '../models/Resume.js'
import { generateResumeWithGemini } from '../services/geminiService.js'

export async function generateResume(req, res) {
  try {
    const inputData = req.body.inputData
    if (!inputData || typeof inputData !== 'object' || typeof inputData.personalInfo?.fullName !== 'string' || !inputData.personalInfo.fullName.trim()) {
      return res.status(400).json({ message: 'Full name is required.' })
    }
    const generatedContent = await generateResumeWithGemini(inputData)
    const record = await Resume.create({
      userId: req.userId,
      title: inputData.targetRole?.trim() || `${inputData.personalInfo.fullName.trim()}'s resume`,
      template: ['classic', 'modern', 'minimal'].includes(req.body.template) ? req.body.template : 'classic',
      inputData,
      generatedContent,
    })
    res.status(201).json(record)
  } catch (error) {
    console.error('Resume generation error:', error.message)
    res.status(503).json({ message: 'Resume generation is temporarily unavailable.' })
  }
}

export async function listResumes(req, res) {
  const records = await Resume.find({ userId: req.userId })
    .select('title template createdAt updatedAt generatedContent inputData')
    .sort({ updatedAt: -1 })
    .limit(20)
  res.json(records)
}

export async function updateResume(req, res) {
  const update = {}
  if (req.body.inputData) update.inputData = req.body.inputData
  if (req.body.generatedContent) update.generatedContent = req.body.generatedContent
  if (['classic', 'modern', 'minimal'].includes(req.body.template)) update.template = req.body.template
  if (typeof req.body.title === 'string' && req.body.title.trim()) update.title = req.body.title.trim()
  const record = await Resume.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, update, { new: true, runValidators: true })
  if (!record) return res.status(404).json({ message: 'Resume not found.' })
  res.json(record)
}

export async function deleteResume(req, res) {
  const record = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId })
  if (!record) return res.status(404).json({ message: 'Resume not found.' })
  res.json({ id: req.params.id })
}
