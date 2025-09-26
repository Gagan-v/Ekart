import express from "express";
import {
  registerUser,
  loginUser,
  updateUser,
} from "../controllers/authController.js";

const router = express.Router();

// This route registers a new user by hashing password and saving to DB
// @route POST /api/auth/register
router.post("/register", registerUser);

// This route logs in an existing user and returns a JWT token
// @route POST /api/auth/login
router.post("/login", loginUser);

// Update user profile (username/password). No JWT, identified by body.userId
// @route PUT /api/auth/update
router.put("/update", updateUser);

export default router;
