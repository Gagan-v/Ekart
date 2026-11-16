import express from "express";
import { customerAuth } from "../middleware/authMiddleware.js";
import { getOrders, placeOrder } from "../controllers/orderController.js";

const router = express.Router();
router.get("/", customerAuth, getOrders);
router.post("/", customerAuth, placeOrder);
export default router;
