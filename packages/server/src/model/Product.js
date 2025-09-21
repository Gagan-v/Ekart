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
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
