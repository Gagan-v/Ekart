import express from "express";
import {
  addReview,
  getProductReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import { attachUserById } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add a new review (requires user identification without JWT)
router.post("/", attachUserById, addReview);

// Get all reviews for a specific product (public route)
router.get("/product/:productId", getProductReviews);

// Delete a review (requires user identification without JWT)
router.delete("/:reviewId", attachUserById, deleteReview);

export default router;
