import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["mobile", "laptop", "accessories"], // Simplified to only main categories
      required: true,
    },
    // Removed subCategory field - now using only main categories
    // This field previously stored values like "mobile", "laptop" under "electronics" category
    title: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    specs: { type: [String], default: [] }, // store each bullet/line as array item
    imageUrl: { type: String, default: "" }, // will hold S3 URL later
    // Image fields for multiple product images
    image1: { type: String, default: "" }, // Main product image
    image2: { type: String, default: "" }, // Thumbnail image 1
    image3: { type: String, default: "" }, // Thumbnail image 2
    image4: { type: String, default: "" }, // Thumbnail image 3
    // Average rating calculated from reviews
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    // Total number of reviews
    reviewCount: { type: Number, default: 0, min: 0 },
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
