import express from "express";
import { adminLogin } from "../controllers/adminAuthController";

const router = express.Router();

router.post("/login", adminLogin);

export default router;
