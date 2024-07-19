import express from 'express'
import { getOtherUsers, getUser, setUsername } from '../controllers/userController.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/completeSignup',verifyToken, setUsername)
router.get('/getUser',verifyToken, getUser)
router.get('/getOtherUsers', verifyToken, getOtherUsers)

export default router