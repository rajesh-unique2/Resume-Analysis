import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listAssessments, nextQuestion, submitAssessment } from '../controllers/communicationController.js'

const router = Router()
router.use(requireAuth)
router.post('/question', nextQuestion)
router.post('/assess', submitAssessment)
router.get('/history', listAssessments)
export default router
