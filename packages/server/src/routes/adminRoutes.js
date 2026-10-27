import express from "express";
import { adminLogin } from "../controllers/adminAuthController.js";
import { adminAuth } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);

// ✅ Protected route (only logged-in admins can access)
router.get("/dashboard", adminAuth, (req, res) => {
  res.json({ message: `Welcome, ${req.admin.username}` });
});

export default router;
