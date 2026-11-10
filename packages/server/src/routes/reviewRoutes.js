import express from "express";
import {
  addReview,
  getProductReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import { customerAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add a new review (requires a verified customer session)
router.post("/", customerAuth, addReview);

// Get all reviews for a specific product (public route)
router.get("/product/:productId", getProductReviews);

// Delete a review (requires a verified customer session)
router.delete("/:reviewId", customerAuth, deleteReview);

export default router;
