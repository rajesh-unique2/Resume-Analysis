import 'dotenv/config'
import mongoose from 'mongoose'
import { analyzeResumeWithGemini } from '../src/services/geminiService.js'

const results = []

function record(name, passed, details) {
  results.push({ name, passed, details })
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}: ${details}`)
}

async function testGemini() {
  if (!process.env.GEMINI_API_KEY) {
    record('Gemini', false, 'GEMINI_API_KEY is not configured')
    return
  }

  try {
    const response = await analyzeResumeWithGemini({
      resumeText: 'JavaScript developer with two years of React experience.',
      jobDescription: 'Looking for a JavaScript developer with React experience.',
    })

    const validResponse =
      Number.isInteger(response.score) &&
      response.score >= 0 &&
      response.score <= 100 &&
      Array.isArray(response.matchedSkills) &&
      Array.isArray(response.missingSkills) &&
      typeof response.feedback === 'string' &&
      response.feedback.length > 0

    record(
      'Gemini',
      validResponse,
      validResponse ? `received a valid response with score ${response.score}` : 'received an invalid response shape'
    )
  } catch (error) {
    record('Gemini', false, error.message)
  }
}

async function testMongoDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    record('MongoDB', false, 'MONGODB_URI is not configured')
    return
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
    await mongoose.connection.db.command({ ping: 1 })
    record('MongoDB', true, `connected to database "${mongoose.connection.name}" and ping succeeded`)
  } catch (error) {
    record('MongoDB', false, error.message)
  } finally {
    await mongoose.disconnect()
  }
}

try {
  await testGemini()
  await testMongoDB()
} finally {
  const failed = results.filter(({ passed }) => !passed).length
  console.log(`\n${results.length - failed}/${results.length} dependency checks passed`)
  process.exitCode = failed === 0 ? 0 : 1
}