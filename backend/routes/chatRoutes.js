import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import { createChat, fetchMessages, sendMessage } from '../controllers/chatController.js'

const router = express.Router()

router.post('/createChat',verifyToken, createChat)
router.post("/fetchMessages", verifyToken, fetchMessages)
router.post("/sendMessage", verifyToken, sendMessage)

export default router