import express from 'express'
import { getOtherUsers, getUser, getUserChats, setUsername, updateProfile } from '../controllers/userController.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/completeSignup',verifyToken, setUsername)
router.get('/getUser',verifyToken, getUser)
router.get('/getOtherUsers', verifyToken, getOtherUsers)
router.get("/getChats", verifyToken, getUserChats)
router.patch("/updateProfile", verifyToken, updateProfile)

export default router