import mongoose from "mongoose";
import ProductReview from "../model/ProductReview.js";
import Product from "../model/Product.js";

// Add a new review for a product
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment = "" } = req.body ?? {};
    const userId = req.user._id;

    // Validate input
    if (!mongoose.isValidObjectId(productId) || !Number.isInteger(rating) || rating < 1 || rating > 5 || typeof comment !== "string" || comment.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid product and 1–5 whole stars. Comments must be at most 500 characters.",
      });
    }

    if (!req.user.orders?.some(order => order.items.some(item => String(item.productId) === String(productId)))) {
      return res.status(403).json({ success: false, message: "You can only rate products you have ordered" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await ProductReview.findOne({
      userId,
      productId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already rated this product",
      });
    }

    // Create new review
    const review = new ProductReview({
      userId,
      productId,
      rating: parseInt(rating),
      comment: comment.trim(),
    });

    await review.save();

    // Update product's average rating and review count
    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "You have already rated this product" });
    console.error("Error adding review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all reviews for a specific product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate product ID
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get reviews with user information
    const reviews = await ProductReview.find({ productId })
      .populate("userId", "name") // Populate user details
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    // Calculate rating statistics
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    // Count reviews by rating
    const ratingCounts = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    res.status(200).json({
      success: true,
      data: {
        reviews,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        ratingCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update product's average rating and review count
const updateProductRating = async (productId) => {
  try {
    const reviews = await ProductReview.find({ productId });

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        reviewCount: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};

// Delete a review (optional - for future use)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await ProductReview.findOneAndDelete({
      _id: reviewId,
      userId, // Ensure user can only delete their own review
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to delete it",
      });
    }

    // Update product's average rating and review count
    await updateProductRating(review.productId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Only return ratings belonging to the verified customer session.
export async function getMyReviews(req, res) {
  try {
    const reviews = await ProductReview.find({ userId: req.user._id }).select("productId rating comment").lean();
    return res.json({ reviews });
  } catch {
    return res.status(500).json({ message: "Could not load your ratings" });
  }
}
