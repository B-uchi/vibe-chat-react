import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createChat,
  deleteMessage,
  fetchMessages,
  requestDecision,
  sendMessage,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/createChat", verifyToken, createChat);
router.post("/fetchMessages", verifyToken, fetchMessages);
router.post("/sendMessage", verifyToken, sendMessage);
router.patch("/decideRequest", verifyToken, requestDecision);
router.delete("/deleteMessage", verifyToken, deleteMessage);

export default router;
