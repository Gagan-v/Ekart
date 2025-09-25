import express from "express";
import {
  addReview,
  getProductReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add a new review (requires authentication)
router.post("/", authenticateToken, addReview);

// Get all reviews for a specific product (public route)
router.get("/product/:productId", getProductReviews);

// Delete a review (requires authentication)
router.delete("/:reviewId", authenticateToken, deleteReview);

export default router;
