import express from "express";
import { registerUser, loginUser } from "../controllers/authController";

const router = express.Router();

// @route POST /api/auth/register
router.post("/register", registerUser);

// @route POST /api/auth/login
router.post("/login", loginUser);

export default router;
