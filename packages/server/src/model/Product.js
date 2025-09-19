import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["electronics", "home-appliances"], //enum is used because category is fixed
      required: true,
    },
    subCategory: { type: String, required: true }, // e.g. "mobile", "laptop"
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
