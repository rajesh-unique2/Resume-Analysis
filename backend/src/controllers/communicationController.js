import CommunicationAssessment from '../models/CommunicationAssessment.js'
import { assessCommunication, getCommunicationQuestion } from '../services/geminiService.js'

function validAnswers(value) {
  return Array.isArray(value) &&
    value.length >= 1 &&
    value.length <= 8 &&
    value.every((item) =>
      item && typeof item.question === 'string' && item.question.trim() &&
      typeof item.answer === 'string' && item.answer.trim() && item.answer.length <= 4000
    )
}

export async function nextQuestion(req, res) {
  try {
    const answers = Array.isArray(req.body.answers) ? req.body.answers : []
    if (answers.length > 7 || answers.some((item) => !item?.question || !item?.answer)) {
      return res.status(400).json({ message: 'Provide up to seven completed answers.' })
    }
    res.json(await getCommunicationQuestion(answers))
  } catch (error) {
    console.error('Communication question error:', error.message)
    res.status(503).json({ message: 'The communication interviewer is temporarily unavailable.' })
  }
}

export async function submitAssessment(req, res) {
  try {
    if (!validAnswers(req.body.answers)) {
      return res.status(400).json({ message: 'Submit between one and eight non-empty answers.' })
    }
    const report = await assessCommunication(req.body.answers)
    const record = await CommunicationAssessment.create({ userId: req.userId, answers: req.body.answers, ...report })
    res.status(201).json({ id: record._id, ...report, answers: record.answers })
  } catch (error) {
    console.error('Communication assessment error:', error.message)
    res.status(503).json({ message: 'The communication report is temporarily unavailable.' })
  }
}

export async function listAssessments(req, res) {
  const records = await CommunicationAssessment.find({ userId: req.userId })
    .select('overallScore categoryScores createdAt')
    .sort({ createdAt: -1 })
    .limit(20)
  res.json(records)
}
