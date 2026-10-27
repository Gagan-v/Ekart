import express from "express";
import {
  getCart,
  clearCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cartController.js";
import { attachUserById } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require user identification but no JWT
router.get("/", attachUserById, getCart);
router.delete("/", attachUserById, clearCart);
router.post("/add", attachUserById, addToCart);
router.put("/update", attachUserById, updateCartItem);
router.delete("/remove/:id", attachUserById, removeFromCart);

export default router;
