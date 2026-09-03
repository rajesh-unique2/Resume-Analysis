import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import analysisRoutes from './routes/analysisRoutes.js'

const app = express()
const allowedOrigins = (process.env.CORS_ORIGIN || 'https://resume-analysis-project-1-six.vercel.app')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  })
)
app.use(express.json())

app.use('/api', analysisRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

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
