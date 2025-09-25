import mongoose from "mongoose";

const productReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500,
    },
    // createdAt and updatedAt are automatically added by timestamps: true
  },
  { timestamps: true }
);

// Index for efficient queries
productReviewSchema.index({ productId: 1, createdAt: -1 });
productReviewSchema.index({ userId: 1, productId: 1 }, { unique: true }); // Prevent duplicate reviews

const ProductReview = mongoose.model("ProductReview", productReviewSchema);
export default ProductReview;
