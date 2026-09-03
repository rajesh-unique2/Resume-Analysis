import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import {
  analyzeResume,
  analyzeResumeBatch,
  getHistory,
  getAnalysisById,
  deleteHistory,
} from '../controllers/analysisController.js'
import { checkATS } from '../controllers/atsController.js'

const router = Router()

router.post('/analyze', upload.single('resume'), analyzeResume)
router.post('/analyze-batch', upload.single('resume'), analyzeResumeBatch)
router.get('/history', getHistory)
router.get('/history/:id', getAnalysisById)
router.delete('/history/:id', deleteHistory)
router.post('/ats-check', upload.single('resume'), checkATS)

export default router