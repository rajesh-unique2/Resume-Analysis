import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { createApplication, deleteApplication, listApplications, updateApplication } from '../controllers/applicationController.js'

const router = Router()
router.use(requireAuth)
router.get('/', listApplications)
router.post('/', createApplication)
router.patch('/:id', updateApplication)
router.delete('/:id', deleteApplication)
export default router
