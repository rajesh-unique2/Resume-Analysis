import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { deleteResume, generateResume, listResumes, updateResume } from '../controllers/resumeController.js'

const router = Router()
router.use(requireAuth)
router.post('/generate', generateResume)
router.get('/', listResumes)
router.patch('/:id', updateResume)
router.delete('/:id', deleteResume)
export default router
