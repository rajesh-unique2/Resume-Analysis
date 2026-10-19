import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import analysisRoutes from './routes/analysisRoutes.js'
import communicationRoutes from './routes/communicationRoutes.js'
import resumeRoutes from './routes/resumeRoutes.js'
import applicationRoutes from './routes/applicationRoutes.js'
import optimizerRoutes from './routes/optimizerRoutes.js'

const app = express()

const corsOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .map((origin) => origin.replace(/\/+$/, ''))
  .filter(Boolean)

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (
        !requestOrigin ||
        corsOrigins.includes('*') ||
        corsOrigins.includes(requestOrigin)
      ) {
        return callback(null, true)
      }

      return callback(new Error('Origin is not allowed by CORS.'))
    },
  })
)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Public - no login required
app.use('/api/auth', authRoutes)
app.use('/api/communication', communicationRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/optimizer', optimizerRoutes)

// Protected - every route in here requires a valid token (see
// routes/analysisRoutes.js, which applies requireAuth to the whole router)
app.use('/api', analysisRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(400).json({ message: err.message || 'Unexpected server error.' })
})

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
})