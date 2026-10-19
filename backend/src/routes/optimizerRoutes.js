import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { optimize } from '../controllers/optimizerController.js'

const router = Router()
router.use(requireAuth)
router.post('/', upload.single('resume'), optimize)
export default router
