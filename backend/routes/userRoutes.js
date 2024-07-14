import express from 'express'
import { setUsername } from '../controllers/userController.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/completeSignup',verifyToken, setUsername)

export default router