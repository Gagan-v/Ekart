const mongoose = require("mongoose");

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
    specs: { type: [String], default: [] }, // store each bullet/line as array item
    imageUrl: { type: String, default: "" }, // will hold S3 URL later
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
