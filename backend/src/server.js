import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import analysisRoutes from './routes/analysisRoutes.js'

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
)
app.use(express.json())

// Public - no login required
app.use('/api/auth', authRoutes)

// Protected - every route in here requires a valid token (see
// routes/analysisRoutes.js, which applies requireAuth to the whole router)
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