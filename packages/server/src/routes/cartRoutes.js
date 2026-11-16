import express from "express";
import {
  getCart,
  clearCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cartController.js";
import { customerAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// All cart routes require a verified customer session
router.get("/", customerAuth, getCart);
router.delete("/", customerAuth, clearCart);
router.post("/add", customerAuth, addToCart);
router.put("/update", customerAuth, updateCartItem);
router.delete("/remove/:id", customerAuth, removeFromCart);

export default router;
