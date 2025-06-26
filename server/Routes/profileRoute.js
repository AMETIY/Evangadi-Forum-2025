import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
} from "../controllers/profileController.js";
import { authenticateToken } from "../middleWare/auth.js";

const router = express.Router();

// Get current user's profile
router.get("/me", authenticateToken, getMyProfile);

// Update current user's profile
router.put("/me", authenticateToken, updateMyProfile);

// Get any user's profile by userId (public, for avatar display)
router.get("/user/:userId", getProfileByUserId);

export default router;
