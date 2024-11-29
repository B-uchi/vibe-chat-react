import express from "express";
import {
  getChatRequests,
  getOtherUsers,
  getUser,
  getUserChats,
  setUsername,
  unblockUser,
  updateProfile,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/completeSignup", verifyToken, setUsername);
router.get("/getUser", verifyToken, getUser);
router.get("/getOtherUsers", verifyToken, getOtherUsers);
router.get("/getChats", verifyToken, getUserChats);
router.get("/getRequests", verifyToken, getChatRequests);
router.patch("/updateProfile", verifyToken, updateProfile);
router.patch("/unblockUser", verifyToken, unblockUser);
// router.patch("/updateStatus", verifyToken, updateStatus);
export default router;
