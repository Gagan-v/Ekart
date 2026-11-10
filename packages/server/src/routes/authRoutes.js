import express from "express";
import {
  registerUser,
  loginUser,
  updateUser,
  getMe,
  logoutUser,
} from "../controllers/authController.js";

import { customerAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// This route registers a new user by hashing password and saving to DB
// @route POST /api/auth/register
router.post("/register", registerUser);

// This route logs in an existing user and returns a JWT token
// @route POST /api/auth/login
router.post("/login", loginUser);

// Update user profile (username/password). Verified customer session required
// @route PUT /api/auth/update
router.put("/update", customerAuth, updateUser);
router.get("/me", customerAuth, getMe);
router.post("/logout", customerAuth, logoutUser);

export default router;
