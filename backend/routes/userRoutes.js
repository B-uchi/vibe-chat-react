import express from 'express'
import { getUser, setUsername } from '../controllers/userController.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/completeSignup',verifyToken, setUsername)
router.get('/getUser',verifyToken, getUser)

export default router