import express from 'express'
import { setUsername } from '../controllers/userController.js'

const router = express.Router()

router.post('/set-username', setUsername)

export default router